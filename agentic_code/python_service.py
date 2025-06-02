from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
class LoginRequest(BaseModel):
    username: str = None
    password: str
    identifier: str = None

app = FastAPI()

def make_driver(headless: bool = True):
    opts = Options()
    opts.headless = headless
    opts.add_experimental_option("detach", True)
    opts.add_argument("--disable-gpu")
    opts.add_argument("--disable-software-rasterizer")
    svc  = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=svc, options=opts)
def post_login(driver: webdriver.Chrome, final_url: str):
    try:
        max_wait = 600
        poll_time = 1
        start_time=time.time()
        while True:
            current_url=driver.current_url
            if current_url.startswith("https://www.linkedin.com/feed/"):
                driver.get("https://www.linkedin.com/search/results/people/?network=%5B%22F%22%5D&origin=MEMBER_PROFILE_CANNED_SEARCH&sid=4lP")
                wait = WebDriverWait(driver, 15)
                pill = wait.until(
                EC.element_to_be_clickable((By.ID, "searchFilter_currentCompany"))
                )
                pill.click()
                dropdown_id = pill.get_attribute("aria-controls")
                wait.until(EC.visibility_of_element_located((By.ID, dropdown_id)))
                dropdown = driver.find_element(By.ID, dropdown_id)
                xpath_for_google_label = (
                f"//div[@id='{dropdown_id}']"
                f"//label[.//span[text()='Google']]"
                )
                google_label = wait.until(
                EC.element_to_be_clickable((By.XPATH, xpath_for_google_label))
                )
                google_label.click()
                xpath_show_results = (
                    f"//div[@id='{dropdown_id}']"
                    f"//button[.//span[text()='Show results']]"
                )
                show_button = wait.until(
                    EC.element_to_be_clickable((By.XPATH, xpath_show_results))
                )
                show_button.click()
                break
            if time.time() - start_time > max_wait:
                break
            time.sleep(poll_time)
    except Exception as e:
        print(f"Error during post-login processing: {e}")
    # finally:
    #     driver.quit()
@app.post("/login-linkedin")
async def login_linkedin(
    req: LoginRequest,
    background_tasks: BackgroundTasks
):
    if not req.username:
        raise HTTPException(400, "username required")
    driver = make_driver(headless=False)
    try:
        driver.get("https://www.linkedin.com/login")
        driver.find_element("id", "username").send_keys(req.username)
        driver.find_element("id", "password").send_keys(req.password)
        driver.find_element("css selector", "button[type=submit]").click()
        current = driver.current_url
        background_tasks.add_task(post_login, driver, current)
        return {"status": "200", "url": current}
    except Exception as e:
        raise HTTPException(500, str(e))
    # finally:
    #     driver.quit()
    
@app.post("/login-twitter")
async def login_twitter(req: LoginRequest):
    if not req.identifier:
        raise HTTPException(400, "identifier required")
    driver = make_driver(headless=True)
    try:
        driver.get("https://twitter.com/login")
        driver.find_element("name", "text").send_keys(req.identifier)
        driver.find_element("css selector", "div[role=button] span").click()
        driver.implicitly_wait(2)
        driver.find_element("name", "password").send_keys(req.password)
        driver.find_element("css selector", "div[role=button] span").click()
        return {"status": "ok", "url": driver.current_url}
    finally:
        driver.quit()
