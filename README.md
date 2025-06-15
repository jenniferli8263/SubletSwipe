# SubletTinder

## Backend

Make virtual env (name it venv so you don't have to modify gitignore)

```
python -m venv venv
```


Mac:

```
cd STBackend
source venv/bin/activate
```

Windows:

```
cd STBackend
.\venv\Scripts\activate
```

Running backend apis:

Windows:
```
uvicorn server:app --reload
```
then go to http://127.0.0.1:8000/docs to test out apis