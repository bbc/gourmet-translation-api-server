# Languages Lambda

Lambda to fulfill requests made to the translation API /languages endpoint.
Responds with all possible language pairs in the following shape: 
```
{
  "languagePairs": [
    {
      "source": "string",
      "target": "string"
    }
  ]
}
```