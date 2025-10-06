const userService = require("../services/user.service");

const getUserProfile = async (req, res) => {
    try {
        const jwt = req.headers.authorization?.split(' ')[1];
        
        if (!jwt) {
            return res.status(404).send({ error: "token not found" });
        }
        
        const user = await userService.getUserProfileByToken(jwt);
        return res.status(200).send(user);
        
    } catch (error) {
        console.log("error from controller - ", error);
        return res.status(500).send({ error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        return res.status(200).send(users);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).send({ error: "User ID is required" });
        }
        
        const user = await userService.findUserById(id);
        return res.status(200).send(user);
        
    } catch (error) {
        console.log("Get User By ID Error - ", error);
        return res.status(500).send({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        if (!id) {
            return res.status(400).send({ error: "User ID is required" });
        }
        
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).send({ error: "Update data is required" });
        }
        
        const updatedUser = await userService.updateUser(id, updateData);
        
        // Remove password from response
        const { password, ...userResponse } = updatedUser.toObject();
        
        return res.status(200).send({
            message: "User updated successfully",
            user: userResponse
        });
        
    } catch (error) {
        console.log("Update User Error - ", error);
        
        // Handle specific error cases
        if (error.message.includes("already registered")) {
            return res.status(409).send({ error: error.message });
        }
        if (error.message.includes("not found")) {
            return res.status(404).send({ error: error.message });
        }
        
        return res.status(500).send({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).send({ error: "User ID is required" });
        }
        
        const result = await userService.deleteUser(id);
        
        return res.status(200).send({
            message: "User and all related data deleted successfully",
            deletedData: result.deletedRelatedData
        });
        
    } catch (error) {
        console.log("Delete User Error - ", error);
        
        if (error.message.includes("not found")) {
            return res.status(404).send({ error: error.message });
        }
        
        return res.status(500).send({ error: error.message });
    }
};

module.exports = {
    getUserProfile,
    getAllUsers,
    getUserById,
    updateUser, 
    deleteUser
};