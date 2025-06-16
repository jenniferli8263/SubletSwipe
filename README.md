# SubletTinder

## Backend

```
cd STBackend
```

1. (Optional) Make a virtual env and activate it (name it venv so you don't have to modify gitignore)

   ```
   python -m venv venv
   ```

   Mac: `source venv/bin/activate`

   Windows: `.\venv\Scripts\activate`

2. Run `pip install -r requirements.txt`

3. To test APIs:
   * Run `uvicorn server:app --reload` 
   * go to `http://127.0.0.1:8000/docs`
