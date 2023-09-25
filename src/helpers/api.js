import { Preferences } from '@capacitor/preferences'
import { LocalNotifications } from '@capacitor/local-notifications'

async function setup(){
    let filter = await Preferences.get({key: 'filter'})
    let order = await Preferences.get({key: 'order'})
    filter = filter.value
    order = order.value

    if(!filter) await Preferences.set({key: 'filter', value: ''})
    if(!order) await Preferences.set({key: 'order', value: 'Name'})
}

async function create_goal(new_goal){
    let goals = await Preferences.get({key: 'goals'})
    goals = JSON.parse(goals.value)

    if(!goals) goals = []

    new_goal.id = get_max_index(goals)+1
    new_goal.created_at = Date.now()
    new_goal.updated_at = new_goal.created_at
    if(!parseFloat(new_goal.speed)) throw "Speed can't be zero!"

    const parsed_time_unit = parseInt(new_goal.time_unit)
    const parsed_goal_amount = parseFloat(new_goal.goal_amount)
    const parsed_speed = parseFloat(new_goal.speed)

    new_goal.estimated_deadline = new_goal.created_at +
                                  Math.floor(
                                    parsed_time_unit *
                                    (parsed_goal_amount/parsed_speed)
                                  )
    
    new_goal.status = 'PAUSED'
    goals.push(new_goal)

    await create_update_record(new_goal)
    await Preferences.set({key: 'goals', value: JSON.stringify(goals)})
}

async function get_goals(data){
    let goals = await Preferences.get({key: 'goals'})
    goals = JSON.parse(goals.value)

    if(!goals) return []
    if(data?.id) goals = goals.filter(goal => goal.goal_id == data.id)
    goals = goals.sort((a,b) => b.id - a.id)
    return goals
}

async function update_goal(updated_goal){
    let goals = await Preferences.get({key: 'goals'})
    goals = JSON.parse(goals.value)

    if(!goals) throw 'There are no goals registered!'
    const goal = goals.filter(item => item.id == updated_goal.id).pop()
    if(!goal) throw 'Goal not found!'

    const parsed_time_unit = parseInt(updated_goal.time_unit)
    const parsed_goal_amount = parseFloat(updated_goal.goal_amount)
    const parsed_speed = parseFloat(updated_goal.speed)

    updated_goal.estimated_deadline = updated_goal.created_at +
                                      Math.floor(
                                        parsed_time_unit * 
                                        (parsed_goal_amount/parsed_speed)
                                      )
    updated_goal.updated_at = Date.now()


    goals = goals.map(item => {
        if(item.id == updated_goal.id) return updated_goal
        return item
    })

    await create_update_record(updated_goal)

    switch(updated_goal.status){
        case 'COMPLETE':
            await delete_scheduled_notification(updated_goal)
            await notify_goal_completion(updated_goal)
            await Preferences.set({key: 'goals', value: JSON.stringify(goals)})
            if(updated_goal.goal_type == 'ABSTRACT') await complete_subgoals(updated_goal)
            return
        case 'PAUSED':
            await delete_scheduled_notification(updated_goal)
            break
        case 'IN_PROGRESS':
            await delete_scheduled_notification(updated_goal)
            await schedule_notification(updated_goal)
            break
        case 'DELETED':
            goals = goals.filter(item => item.id != updated_goal.id)
            await delete_scheduled_notification(updated_goal)
            await Preferences.set({key: 'goals', value: JSON.stringify(goals)})
            if(updated_goal.goal_type == 'ABSTRACT') await delete_subgoals(updated_goal)
            return
    }
    
    await Preferences.set({key: 'goals', value: JSON.stringify(goals)}) 
}

async function delete_subgoals(goal){
    return change_subgoals_status(goal,'DELETED')
}

async function complete_subgoals(goal){
    return change_subgoals_status(goal,'COMPLETE')
}

async function change_subgoals_status(goal,status){
    let goals = await Preferences.get({key: 'goals'})
    goals = JSON.parse(goals.value)

    if(!goals) throw 'There are no goals registered!'
    let subgoals = goals.filter(item => item.goal_id == goal.id)

    if(!subgoals.length) return

    subgoals = subgoals.map(subgoal => {
        subgoal.status = status
        return subgoal
    })

    console.log('subgoals: ',subgoals)

    for(const subgoal in subgoals){
        console.log('updating subgoal: ',subgoals[subgoal])
        const copy = JSON.parse(JSON.stringify(subgoals[subgoal]))
        await update_goal(copy)
    }
}

async function create_update_record(goal){
    let records = await Preferences.get({key: 'records'})
    records = JSON.parse(records.value)

    if(!records) records = []

    const new_record = JSON.parse(JSON.stringify(goal))
    new_record.date = Date.now()

    records.push(new_record)
    await Preferences.set({key: 'records', value: JSON.stringify(records)})
}

async function delete_goal(data){
    return update_goal_status(data,'DELETED')
}

function start_goal(data){
    return update_goal_status(data,'IN_PROGRESS')
}

function pause_goal(data){
    return update_goal_status(data,'PAUSED')
}

function complete_goal(data){
    return update_goal_status(data,'COMPLETE')
}

function update_goal_status(updated_goal,status){
    updated_goal.status = status
    return update_goal(updated_goal)
}

async function schedule_notification(goal){    
    let notifications = await Preferences.get({key: 'notifications'})
    notifications = JSON.parse(notifications.value)

    if(!notifications) notifications = []

    if(!goal.deadline) return 
    const title = `Deadline for "${goal.name}" reached!`
    let body = null
    const late_milliseconds = Date.now() - goal.deadline

    if(late_milliseconds >= 60000){
        body = `Should've ended ${(late_milliseconds/3600000).toFixed(2)} hours ago`
    }else{
        body = 'Just now'
    }

    const new_notification = {
        id: goal.id,
        title: title,
        body: body,
        schedule: late_milliseconds > 0 ? null : { at: new Date(goal.deadline) }
    }

    LocalNotifications.schedule({notifications: [new_notification]})

    new_notification.goal_id = goal.id
    notifications.push(new_notification)
    await Preferences.set({key: 'notifications', value: JSON.stringify(notifications)})
}

async function delete_scheduled_notification(goal){
    let notifications = await Preferences.get({key: 'notifications'})
    notifications = JSON.parse(notifications.value)

    if(!notifications) return

    let notification = notifications
                        .filter(item => item.goal_id == goal.id)
                        .pop()
    
    if(!notification) return
    notification = JSON.parse(JSON.stringify(notification))

    delete notification.goal_id
    notifications = notifications.filter(item => item.goal_id != goal.id)

    LocalNotifications.cancel({
        notifications: [
            notification
        ]
    })

    await Preferences.set({key: 'notifications', value: JSON.stringify(notifications)})
}

function notify_goal_completion(goal){
    let body = null

    switch(goal.goal_type){
        case 'ABSTRACT':
            body = `Goal completed in ${time_format(goal)}`
            break
        case 'EXECUTABLE':
            body = goal.goal_amount+' '+goal.measure_unit+' in '+time_format(goal)
            break
    }

    const new_notification = {
        id: goal.id,
        title: 'Goal "'+goal.name+'" is complete!',
        body: body
    }

    LocalNotifications.schedule({
        notifications: [
            new_notification
        ]
    })
}

function time_format(goal){
    const out = ''
    switch(parseInt(goal.time_unit)){
        case 1000:
            return '~'+((goal.updated_at - goal.created_at)/1000)
                    .toFixed(2)+' seconds'
        case 60000:
            return '~'+((goal.updated_at - goal.created_at)/60000)
                    .toFixed(2)+' minutes'
        case 3600000:
            return '~'+((goal.updated_at - goal.created_at)/3600000)
                    .toFixed(2)+' hours'
        case 86400000:
            return '~'+((goal.updated_at - goal.created_at)/86400000)
                    .toFixed(2)+' days'
        case 604800000:
            return '~'+((goal.updated_at - goal.created_at)/604800000)
                    .toFixed(2)+' weeks'
        case 2592000000:
            return '~'+((goal.updated_at - goal.created_at)/2592000000)
                    .toFixed(2)+' months'
        case 5184000000:
            return '~'+((goal.updated_at - goal.created_at)/5184000000)
                    .toFixed(2)+' bimesters'
        case 7776000000:
            return '~'+((goal.updated_at - goal.created_at)/7776000000)
                    .toFixed(2)+' trimesters'
        case 15552000000:
            return '~'+((goal.updated_at - goal.created_at)/15552000000)
                    .toFixed(2)+' semesters'
        case 31104000000:
            return '~'+((goal.updated_at - goal.created_at)/31104000000)
                    .toFixed(2)+' years'
    }
}

async function mark_tutorial_as_done(){
    await Preferences.set({key: 'tutorial', value: 'done'})
}

async function should_show_tutorial(){
    const tutorial = await Preferences.get({key: 'tutorial'})
    const show_tutorial = await Preferences.get({key: 'show_tutorial'})
    console.log('should_show_tutorial: ',!tutorial.value,show_tutorial.value)
    return !tutorial.value || show_tutorial.value
}

async function show_tutorial(){
    await Preferences.set({key: 'show_tutorial', value: 'done'})
}

async function reset_show_tutorial(){
    await Preferences.remove({key: 'show_tutorial'})
}

function get_tutorial_pages(){
    return [
        {
            title: 'Types of goals',
            media: '/tutorial_1.jpg',
            type: 'image',
            text: "<p>Abstract goals represent wide scope objectives, which can't be executed immedially, in a direct manner, since they depend and are formed by many minor tasks.</p><br><p>Executable tasks are closed scope objectives, that can be attained immediatelly and can generally be measured in an objective manner. They are the true bulding blocks of any objective, big or small.</p>",
        },
        {
            title: 'Goal status',
            media: '/tutorial_2.webm',
            type: 'video',
            text: '<p>To better manage the goals, they can assume two status: paused and in progress.</p><br><p>In progress activities represent the fact that the user is focused on them at the present moment.</p><br><p>All goals start as paused, and may change their status from and to that at any moment, unless they are completed or deleted.</p>',
        },
        {
            title: 'Goal progress',
            media: '/tutorial_3.webm',
            type: 'video',
            text: "<p>All executable goal items have an incremente button. This way, the user can update the goal's progress quickly without the need of editting it.</p>",
        },
        {
            title: 'Completing goals',
            media: '/tutorial_4.webm',
            type: 'video',
            text: '<p>When an executable task reaches its goal amount, it is instantly completed.</p><br><p>An abstract goal can only be completed directly by the user.</p><br><p><b>ATTENTION!</b> By completing an abstract goal, all its subgoals will also be completed.</p>',
        },
        {
            title: 'Deleting goals',
            media: '/tutorial_5.webm',
            type: 'video',
            text: "<p>Goals can be deleted at any moment, unless they aren't complete.</p><br><p><b>ATTENTION!</b> By deleting an abstract goal, all its subgoals will also be deleted.</p>",
        },
        {
            title: 'Creating goals',
            media: '/tutorial_6.webm',
            type: 'video',
            text: "<p>To create a new goal, click in \"New goal\" at the home page. Then, fill in the form with the your task's data.</p><br><p>Goal Amount(GA): quantity necessary to achieve the goal.</p><br><p>Measure Unit(MU): measure unit of the goal.</p><br><p>Time Unit(TU): time unit to measure goal progress.</p><br><p>Speed(S): estimated speed to progress the goal.</p><br><p>Current Amount(CA): goal's starting amount. Goals start at zero by default.</p><br><p>Deadline(DL): Date until which the goal should be completed. When this date is reached, a notification is dispatched if the task is in progression and hasn't been completed.</p><br><p>e.g.: In the task 'Read 5 books from April to June', we have:</p><br><p>GA = 5</p><br><p>MU = \"books\"</p><br><p>TU = \"months\"</p><br><p>DL = \"July 30\"</p><br><p>If the user thinks that he'll read 2 reads/month, then S = 2</p>",
        },
        {
            title: 'Editing goals',
            media: '/tutorial_7.webm',
            type: 'video',
            text: "<p>To edit a goal, click at the task's list item and select the edit option.</p><br><p><b>ATTENTION!</b> An abstract goal can only become an executable goal if it doesn't have any subgoals.</p>",
        }
    ]
}

async function get_records(){
    const records = await Preferences.get({key: 'records'})
    console.log('records: ',records.value)
    return records.value
}

function get_max_index(data){
    if(data.length){
        return data
        .filter(item => true)
        .sort((a,b) => a.id - b.id)
        .pop().id
    }else{
        return 0
    }
}

async function set_filter(filter){
    await Preferences.set({key: 'filter', value: filter})
}

async function set_order(order){
    await Preferences.set({key: 'order', value:  order})
}

async function get_default_filter(){
    const filter =  await Preferences.get({key: 'filter'})
    return filter.value ? filter.value : ''
}

async function get_default_order(){
    const order =  await Preferences.get({key: 'order'})
    return order.value
}

setup()

export {
    create_goal,
    update_goal,
    start_goal,
    pause_goal,
    complete_goal,
    delete_goal,
    get_goals,
    get_records,
    get_tutorial_pages,
    mark_tutorial_as_done,
    should_show_tutorial,
    show_tutorial,
    reset_show_tutorial,
    set_filter,
    set_order,
    get_default_filter,
    get_default_order
}