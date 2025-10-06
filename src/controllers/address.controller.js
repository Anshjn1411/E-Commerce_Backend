const addressService = require("../services/address.service");
const jwtProvider = require("../config/jwtProvider");

const createAddress = async (req, res) => {
    try {
        const jwt = req.headers.authorization?.split(' ')[1];
        
        if (!jwt) {
            return res.status(401).send({ error: "Authorization token not found" });
        }
        
        const userId = jwtProvider.getUserIdFromToken(jwt);
        const addressData = req.body;
        
        if (!addressData || Object.keys(addressData).length === 0) {
            return res.status(400).send({ error: "Address data is required" });
        }
        
        const address = await addressService.createAddress(addressData, userId);
        
        return res.status(201).send({
            message: "Address created successfully",
            address: address
        });
        
    } catch (error) {
        console.log("Create Address Controller Error -", error);
        
        if (error.message.includes("User not found")) {
            return res.status(404).send({ error: error.message });
        }
        
        return res.status(500).send({ error: error.message });
    }
};

const getUserAddresses = async (req, res) => {
    try {
        const jwt = req.headers.authorization?.split(' ')[1];
        
        if (!jwt) {
            return res.status(401).send({ error: "Authorization token not found" });
        }
        
        const userId = jwtProvider.getUserIdFromToken(jwt);
        const addresses = await addressService.getAddressesByUserId(userId);
        
        return res.status(200).send(addresses);
        
    } catch (error) {
        console.log("Get User Addresses Controller Error -", error);
        
        if (error.message.includes("User not found")) {
            return res.status(404).send({ error: error.message });
        }
        
        return res.status(500).send({ error: error.message });
    }
};

const getDefaultAddress = async (req, res) => {
    try {
        const jwt = req.headers.authorization?.split(' ')[1];
        
        if (!jwt) {
            return res.status(401).send({ error: "Authorization token not found" });
        }
        
        const userId = jwtProvider.getUserIdFromToken(jwt);
        const defaultAddress = await addressService.getDefaultAddress(userId);
        
        return res.status(200).send({
            message: "Default address retrieved successfully",
            address: defaultAddress
        });
        
    } catch (error) {
        console.log("Get Default Address Controller Error -", error);
        
        if (error.message.includes("User not found") || error.message.includes("No default address")) {
            return res.status(404).send({ error: error.message });
        }
        
        return res.status(500).send({ error: error.message });
    }
};

const setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const jwt = req.headers.authorization?.split(' ')[1];
        
        if (!jwt) {
            return res.status(401).send({ error: "Authorization token not found" });
        }
        
        if (!id) {
            return res.status(400).send({ error: "Address ID is required" });
        }
        
        const userId = jwtProvider.getUserIdFromToken(jwt);
        const defaultAddress = await addressService.setDefaultAddress(id, userId);
        
        return res.status(200).send({
            message: "Default address set successfully",
            address: defaultAddress
        });
        
    } catch (error) {
        console.log("Set Default Address Controller Error -", error);
        
        if (error.message.includes("not found") || error.message.includes("permission")) {
            return res.status(404).send({ error: error.message });
        }
        
        return res.status(500).send({ error: error.message });
    }
};

const getAddressById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).send({ error: "Address ID is required" });
        }
        
        const address = await addressService.getAddressById(id);
        return res.status(200).send(address);
        
    } catch (error) {
        console.log("Get Address By ID Controller Error -", error);
        
        if (error.message.includes("not found")) {
            return res.status(404).send({ error: error.message });
        }
        
        return res.status(500).send({ error: error.message });
    }
};

const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const jwt = req.headers.authorization?.split(' ')[1];
        const updateData = req.body;
        
        if (!jwt) {
            return res.status(401).send({ error: "Authorization token not found" });
        }
        
        if (!id) {
            return res.status(400).send({ error: "Address ID is required" });
        }
        
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).send({ error: "Update data is required" });
        }
        
        const userId = jwtProvider.getUserIdFromToken(jwt);
        const updatedAddress = await addressService.updateAddress(id, updateData, userId);
        
        return res.status(200).send({
            message: "Address updated successfully",
            address: updatedAddress
        });
        
    } catch (error) {
        console.log("Update Address Controller Error -", error);
        
        if (error.message.includes("not found") || error.message.includes("permission")) {
            return res.status(404).send({ error: error.message });
        }
        
        return res.status(500).send({ error: error.message });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const jwt = req.headers.authorization?.split(' ')[1];
        
        if (!jwt) {
            return res.status(401).send({ error: "Authorization token not found" });
        }
        
        if (!id) {
            return res.status(400).send({ error: "Address ID is required" });
        }
        
        const userId = jwtProvider.getUserIdFromToken(jwt);
        const deletedAddress = await addressService.deleteAddress(id, userId);
        
        return res.status(200).send({
            message: "Address deleted successfully",
            address: deletedAddress
        });
        
    } catch (error) {
        console.log("Delete Address Controller Error -", error);
        
        if (error.message.includes("not found") || error.message.includes("permission")) {
            return res.status(404).send({ error: error.message });
        }
        
        return res.status(500).send({ error: error.message });
    }
};

const getAllAddresses = async (req, res) => {
    try {
        const addresses = await addressService.getAllAddresses();
        return res.status(200).send(addresses);
        
    } catch (error) {
        console.log("Get All Addresses Controller Error -", error);
        return res.status(500).send({ error: error.message });
    }
};

module.exports = {
    createAddress,
    getUserAddresses,
    getDefaultAddress,
    setDefaultAddress,
    getAddressById,
    updateAddress,
    deleteAddress,
    getAllAddresses
};