# Translation API Proxy Lambda

Lambda to map API Gateway requests to the Load Balancer in front of the ECS Cluster

## Developing Locally

### Set Up

1. Install node modules

```
npm install
```

### Run Locally

The functionality of the lambda is contained in the [`translate`](./translate.js) function so this can be called locally using `node` without needing to deploy the lambda.

1. Start node 

```
node
```
2. Import translate

```
const translate = require('./translate')
```
2. call translate

```
const input = {"body": JSON.stringify({"q": "input", "source": "en", "target": "bg"})}
translate(input)
```