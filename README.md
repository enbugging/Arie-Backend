# Arie's Backend
This is API and Database infrastructure being specifically build for Arie application - team Kori's project in e-ICON World Contest 2019. The name of the team and the application derive from using Google translate to translate "Arie" and "Kori" as "there" and "here".

<b> API Guide </b>
 * Routes in this API, by order (also the order of test cases)
 * POST tasks : create new task
 * GET tasks/?idx= & count= : retrieve general info of number of tasks
 * (including custom parameters to search)
 * GET tasks/:taskID : retrieve details of a particular task
 * PATCH tasks/:taskID?userID= : edit existing task
 * POST tasks/:taskID?userID= : subscribe to a task
 * DELETE tasks/:taskID?userID= : delete existing task
