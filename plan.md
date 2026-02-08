
user
    name
    email
    password
    money
    loan
    trust
    pvt_cards
    bet_admin
    bet_joined
    transaction_history

bets
    id
    title
    creator
    status
    bet_type
    bet_code
    outcomes and odds
    pool
    start_time
    end_time
    result
    base_price
    
    participants

admin
    calculate money

input calls
    loginuser
    register user
    create bet
    join bet
    declare result
    close bet
    apply loan
    repay loan



ill mention the api calls list ...do changes accordingly to the main.py 

//fetch all public bets (this will just show each bet id ,pool and end time,yes no stakes)
//fetch all pvt bets of that particular user(this will show the pvt bet in which the user has reg)
//fetch user info(this will show complete user details)
//fetch user transaction history(this will show the transaction history of the user)
//fetch user loan history(this will show the loan history of the user)
//fetch the bet attributes(this will show the bet attributes of the bet)
//

data i recieve from the frontend
//user login info(this will provide user login credentials and make a new entry in my database,while checking if it already exists)
//create bet(this will create a new bet in the database and also user will provide its attributes )
//join bet(user will join the bet...and will get updated in the database)
//declare result(user will declare the result of the bet...and will get updated in the database,everryone will get updated)
//close bet(user will close the bet...and will get updated in the database)
//apply loan(user will apply for loan...and will get updated in the database)
//repay loan(user will repay the loan...and will get updated in the database)



i will mention all do's and donts and check it once in main.py 

user can only login if he is registered
no double regestration
public bets are visible to all users
to access pvt bet the user has to provide the unique code
every user has 10 pvt cards and each card is used to create a pvt bet
creator of bet cannot participate in the bet
the creator of bet will get 1% of the total pool value as commission


python main.py
npm run dev
.\start_frontend.bat