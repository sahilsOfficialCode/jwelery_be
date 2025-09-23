const Address = require('../model/address.model'); // adjust path as needed

// Service function to add address
exports.addAddressService = async (addressData, userId) => {
  try {
    const userAddressExist = await Address.find({ user: userId });

    const { 
      name, 
      addressLine1, 
      addressLine2, 
      city, 
      state, 
      country, 
      postalCode, 
      phone, 
      default: isDefault 
    } = addressData;

    if (!name || !addressLine1 || !city || !state || !country || !postalCode || !phone) {
      return { status: false, message: "All required fields must be provided" };
    }

    // Handle default address logic
    if (!userAddressExist.length || isDefault) {
      if (isDefault) {
        await Address.updateMany({ user: userId, default: true }, { default: false });
      }
    }

    const newAddress = new Address({
      name,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      postalCode,
      phone,
      user: userId,
      default: !userAddressExist.length || isDefault // set default if first or explicitly default
    });

    const savedAddress = await newAddress.save();

    return { status: true, data: savedAddress, message: "Your address has been saved successfully." };

  } catch (error) {
    throw new Error(error.message);
  }
};

exports.getAllAddressesService = async (userId) => {
    try {
        const addresses = await Address.find({ user: userId }).sort({ createdAt: -1 });
        if (!addresses.length) return { status: false, data: addresses, message: "Could not find any address" }
        return { status: true, data: addresses, message: "All addresses retrieved successfully" };
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.deleteAddressService = async (addressId) => {
    try {
        const deletedAddress = await Address.findByIdAndDelete(addressId);
        if (!deletedAddress) {
            return { status: false, message: "Address not found" }
        }
        return { status: true, data: deletedAddress, message: "The address has been removed successfully" }
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.updateAddressService = async (addressId, updateData) => {
    try {
        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedAddress) {
            return { status: false, data: [], message: "Address not found" }
        }

        return { status: true, data: updatedAddress, message: "address updated successfully" };
    } catch (error) {
        throw new Error(error.message);
    }
};