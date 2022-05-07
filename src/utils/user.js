const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({
    id,
    username,
    room
}) => {
    // clean the data (make sure that the data is in correct format)
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required.'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // validate username
    if (existingUser) {
        return {
            error: 'Username is already in use.'
        }
    }

    // else store user
    const user = {
        id,
        username,
        room
    }
    users.push(user)
    return {
        user
    }
}

// remove user from users array by using their id
const removeUser = (id) => {

    // find index of user that need to be removed
    const index = users.findIndex((user) => user.id === id)

    // if index is 1 that means users exist and need to be removed using splice method
    if (index != -1) {
        // return the user that we removed --> will return an array
        return users.splice(index, 1)[0]
    }
}


// getUser accept id and return user object (or undefined)
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

// getUsersInRoom accept room name and return array of users (or empty array)
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room == room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}