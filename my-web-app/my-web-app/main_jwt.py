from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "SUPER_SECRET_KEY" # Change this!
ALGORITHM = "HS256"

# Mock Database (In production, use SQLAlchemy + PostgreSQL)
users_db = {}

class User(BaseModel):
    username: str
    password: str

@app.post("/register")
def register(user: User):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    hashed_password = pwd_context.hash(user.password)
    users_db[user.username] = {"password": hashed_password}
    return {"message": "User created successfully"}

@app.post("/login")
def login(user: User):
    user_in_db = users_db.get(user.username)
    if not user_in_db or not pwd_context.verify(user.password, user_in_db["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode({
        "sub": user.username,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": token, "token_type": "bearer"}