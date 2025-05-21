from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

class LoginRequest(BaseModel):
    username: str = None
    password: str
    identifier: str = None

app = FastAPI()

def make_driver(headless: bool = True):
    opts = Options()
    opts.headless = headless
    opts.add_experimental_option("detach", True)
    svc  = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=svc, options=opts)

@app.post("/login-linkedin")
async def login_linkedin(req: LoginRequest):
    if not req.username:
        raise HTTPException(400, "username required")
    driver = make_driver(headless=False)
    try:
        driver.get("https://www.linkedin.com/login")
        driver.find_element("id", "username").send_keys(req.username)
        driver.find_element("id", "password").send_keys(req.password)
        driver.find_element("css selector", "button[type=submit]").click()
        current = driver.current_url
        return {"status": "ok", "url": current}
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
