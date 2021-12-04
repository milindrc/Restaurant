# Backend System Overview

## This sections contails all the details about the backend system and the instructions

## Table of Contents

- [Assumptions](#assumptions)
- [Installation](#installation)
- [Usage](#usage)
- [Stucture](#structure)
- [License](#license)

## Assumptions
 - All the order id(s) will always be unique
 - Restaurant id will be provided in each request
 - Marking order as delivered is not to be implemented as it is not mentions in the requirement specification

## Installation
Use the following link to run the project in replit.com
https://replit.com/join/sciijtdifq-milindrc

## Usage
The project can only be used with rest apis.

Please find the collection of all the apis in the following postman collection link
https://go.postman.co/workspace/My-Workspace~702bcf20-953d-49a5-8109-8b18e79198e3/collection/264208-98f86a7a-75bb-4ced-a37a-0450fff63e3a

**These apis are created in a way such that all orders can be submitted together as well as individually** 

**For submitting all orders together:**
https://restaurant.milindrc.repl.co/api/restaurant/:resturantId

**For submitting single order:**
https://restaurant.milindrc.repl.co/api/restaurant/:resturantId/single-order

**The format of the request is same as mentioned in the input document:**
[Input Document](
https://s3.us-west-2.amazonaws.com/secure.notion-static.com/40947f0e-1e8e-4422-94be-22e885950239/input.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20211204%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211204T065440Z&X-Amz-Expires=86400&X-Amz-Signature=d2bdb1b67fcbe77e94dd15f9f88ab21b81553485b0ac8d91e6c2994d7dcf544b&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22input.txt%22&x-id=GetObject)

## Stucture
- All the apis provide a json response with some common parameters
  - status : for indicating success or failure
  - message : short description of response to the client
  - responseCode : indicating the type of response
  - data : the actual information of the response
- For **Storage** the inbuild **Replit Database** is used


# System Design Overview

## This section contails the information for *Extention of problem 1*

## Select a Database you want to use to solve this problem.

I would prefer MongoDb (NoSql) for this solution as it provides more flexibility of structure. Assuming that there will vast amount of variations in how different restaurants work this DB will be better to accomodate those variations.

## Write down which tables you are going to make and mention the keys (primary, partition, sort keys, indexes and whichever apply to you etc)

> Note: Primary is assumed indexed

**Restaurant Table**
  - id (primary)
  - name
  - maxCookingSlots
  - maxAcceptableOrderTime
  - city (partition key)
  - location

**Restaurant Products Table**
  - id (primary)
  - restaurantId (indexed FK)
  - name
  - slotWeight
  - cookingTime
  - price

**Orders Table**
  - id (primary)
  - restaurantId (indexed FK)
  - distance
  - status [created,cooking, queued, denied] (indexed)
  - creation timestamp
  - start timestamp (default: creation timestamp)
  - delivered timestamp  
  - amount

**Order Meals Table**
  - id (primary)
  - orderId (indexed FK)
  - productId (indexed FK)
  - name

## Write down the flow of CRUD. (Eg. When someone creates and order, what all entries will get made.) (Eg. How will you manage scheduled orders as in how will you actually go about processing them at the given time when they are saved in your table)

1. When someone creates a order a new record in order table is inserted and all the meals in the orders is inserted in OrderMeal table with the same order id.
Then the order prepare event is passed to the next service
2. On order prepare event there will be a service that will assign a new status to the order 
    - if the order can be cooked, the status will change from created to cooking
    - if the order cannot accomodate the cooking slots, the status will change from created to denied
    - id the order can be prepared but the cooking slots are full, the status will changte from created to queued
3. Every order will have a start time which will be the creation time by default. But for scheduled order the start time will be in future. The start time could be **targetTime - preprationTime - buffer**. If a scheduled order is encountered and job will be created which will launch at the start time and issue a order prepare event.

  For recurring scheduled orders a recurring cron job can be created which will run with regard to order frequency. This cron job will created a clone order by refrencing the original order. and issue a order prepare event.
4. For editing a order there will be multiple possibilities:
    - if the order is already preparing and there are enough cooking slots for the updated order the update will be accepted.
    - if the order is already preparing and there are not enough cooking slots the update request will be rejected as the question stated that **order cannot be prepared in parts**
    - if the order is queued the update can simply be accepted 

  
  If the update is accepted the waiting time of all orders will have to be updated
