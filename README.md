# 🏠 SubletTinder

# Milestone 1
## Where to find C2 and C3
The SQL code we used for creating our tables is under the path `STBackend/database_setup/SQLQueries/`. You can also find the SQL queries for our 5 basic features in this directory, along with the corresponding output.

## How to create/load the sample database
Our database is hosted on the cloud using Neon, simply follow the steps below to run a local backend server which will automatically connect you to the database.

## How to generate "production" dataset and load into database
The full Production dataset is in `STBackend/data/prod.xlsx`. The data is already loaded into our Neon production database; the connection string for this can be found at the end of our report. The python script used to load clean and load the data in `prod.xlsx` can be found at `STBackend/data/insert_data.ipynb`. Running all blocks in the jupyter notebook will clean then re-populate the production database on Neon.

## 💡 Current Features
- Add a listing: `STBackend/routes/listings.py`
- Get details of a listing: `STBackend/routes/listings.py`
- Deactivate a listing: `STBackend/routes/listings.py`
- User signup and login: `STBackend/routes/auth.py`
- Delete a user: `STBackend/routes/users.py`

We have implemented endpoints on the backend for these features. See below on how to run a local server and test the features via the backend.
The first three features have also been implemented on our frontend.

## 🛠️ How to run the backend
1. Clone the repo into your local machine.
```
git clone https://github.com/jessicaxu0605/SubletTinder.git
```

2. Navigate into the STBackend directory.
```
cd SubletTinder/STBackend
```

3. (Optional) Make a virtual env and activate it
```
python -m venv venv
```
   Mac: `source venv/bin/activate`
   
   Windows: `.\venv\Scripts\activate`

4. Install dependencies
```
pip install -r requirements.txt
```

5. Create an environment (.env) file in the STBackend directory. Inside it should have the following:
```
DATABASE_URL=your_database_url // copy and paste here from the Milestone 1 report
```

6. To test the features:
- Run `uvicorn server:app --reload` 
- Navigate to `http://127.0.0.1:8000/docs` in your browser. This will open up the Swagger UI which is used as an interactive interface to test endpoints.

7. You will see two HTTP endpoints, GET and POST, for retrieving listing details and adding a listing respectively. You can test each out by opening a section and clicking **Try it out**

### Example
<img width="1070" alt="Screenshot 2025-06-17 at 4 43 58 PM" src="https://github.com/user-attachments/assets/c126ccd3-b893-48bf-88e1-e162d280d99d" />

## 👩‍💻 How to run the frontend
1. Make sure the backend server has been started.
2. Navigate into the STFrontend directory.
3. Run the following command to install requirements
```
npm install
```
4. Start the expo server
```
npx expo start --clear
```
