# Translate Lambda

Lambda to map API Gateway requests to the Load Balancer in front of the ECS Cluster

## Developing Locally

### Set Up

1. Install node modules

```
npm install
```

### Run Locally

The functionality of the lambda is contained in the [`translate`](./translate.js) function so this can be called locally using `node` without needing to deploy the lambda.

1. (OPTIONAL) If you want to use the local language model, follow the instructions [here](https://github.com/bbc/gourmet-translation-api/blob/master/docs/addingATranslationModel.md#1-test-new-docker-image-locally) and run:
```
export NODE_ENV=local
```

2. Start node

```
node
```

3. Import translate

```
const translate = require('./translate')
```
4. call translate

```
const input = {"body": JSON.stringify({"q": "input", "source": "en", "target": "bg"})}
translate(input)
```
