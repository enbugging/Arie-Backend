# Arie's Backend

This is API and Database infrastructure being specifically built for Arie application - team Kori's project in e-ICON World Contest 2019. The name of the team and the application were derived from using Google translate to translate "Arie" and "Kori" as "there" and "here", which came from abbreviating "ARtIficial Eye" and merging "Korea - Vietnam" into one word before pronouncing it in Japanese way.

<b> API Guide </b>

Routes in this API, by order

1. API for users

-   GET tasks/user/:userId : retrieve data of an user
-   POST tasks/user : login to database
-   PATCH tasks/user/:userID : update results
-   DELETE tasks/user/:userId : logout from database

2. API for tasks

-   POST tasks : create new task
-   GET tasks/?idx= & count= : retrieve general info of number of tasks
-   (including custom parameters to search)
-   GET tasks/trending : retrieve top 5 trending tasks (or all tasks if there're less than 5)
-   GET tasks/:taskID : retrieve details of a particular task
-   PATCH tasks/:taskID?userID= : edit existing task
-   DELETE tasks/:taskID?userID= : delete existing task
-   POST tasks/:taskID?userID= : subscribe to a task
-   DELETE tasks/unsubscribe/:taskID?userID= : unsubscribe to a task
