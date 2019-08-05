# GoURMET Translation API

# Translation Models Cluster

The cluster uses ECS. In this instance the containers are running on Fargate.

## Adding a new translation model

1. Open up a port on the ELB by adding an ingress rule to the ELB security group.
2. Add a Task Definition
3. Add a Listener. This should be listening on the port that was opened up in step 1
4. Add an ECS Service