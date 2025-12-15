const captainModel = require("../models/captain.model");
const rideModel = require("../models/ride.model");
const mapService = require("./map.service");
const crypto = require("crypto");

const getFare = async (pickup, destination) => {
  if (!pickup || !destination) {
    throw new Error("Pickup y destino son requeridos");
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);

  // Tarifas base en COP (Pesos Colombianos)
  const baseFare = {
    car: 5000,
    bike: 3000,
  };

  // Tarifa por Km en COP
  const perKmRate = {
    car: 1500,
    bike: 1000,
  };

  // Tarifa por minuto en COP
  const perMinuteRate = {
    car: 200,
    bike: 150,
  };

  const fare = {
    car: Math.round(
      baseFare.car +
        (distanceTime.distance.value / 1000) * perKmRate.car +
        (distanceTime.duration.value / 60) * perMinuteRate.car
    ),
    bike: Math.round(
      baseFare.bike +
        (distanceTime.distance.value / 1000) * perKmRate.bike +
        (distanceTime.duration.value / 60) * perMinuteRate.bike
    ),
  };

  return { fare, distanceTime };
};

module.exports.getFare = getFare;

function getOtp(num) {
  function generateOtp(num) {
    const otp = crypto
      .randomInt(Math.pow(10, num - 1), Math.pow(10, num))
      .toString();
    return otp;
  }
  return generateOtp(num);
}

module.exports.createRide = async ({
  user,
  pickup,
  destination,
  vehicleType,
}) => {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error("Todos los campos son requeridos");
  }

  try {
    const { fare, distanceTime } = await getFare(pickup, destination);

    // PERF-001: Get and store coordinates to eliminate N+1 queries later
    const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
    const destinationCoordinates = await mapService.getAddressCoordinate(destination);

    const ride = await rideModel.create({
      user,
      pickup,
      destination,
      // PERF-001: Store coordinates in ride document
      pickupCoordinates,
      destinationCoordinates,
      otp: getOtp(6),
      fare: fare[vehicleType],
      vehicle: vehicleType,
      distance: distanceTime.distance.value,
      duration: distanceTime.duration.value,
    });

    return ride;
  } catch (error) {
    throw new Error("Error al crear el viaje.");
  }
};

module.exports.confirmRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error("El ID del viaje es requerido");
  }

  try {
    // Atomic update: only accept if status is still 'pending'
    // This prevents race conditions where multiple drivers accept the same ride
    const ride = await rideModel.findOneAndUpdate(
      {
        _id: rideId,
        status: "pending", // Only update if still pending
      },
      {
        status: "accepted",
        captain: captain._id,
      },
      { 
        new: true // Return the updated document
      }
    )
    .populate("user")
    .populate("captain")
    .select("+otp");

    // If ride is null, it means it was already accepted by another driver
    if (!ride) {
      throw new Error("Este viaje ya fue aceptado por otro conductor");
    }

    // Update captain's rides list
    const captainData = await captainModel.findOne({ _id: captain._id });
    captainData.rides.push(rideId);
    await captainData.save();

    return ride;
  } catch (error) {
    console.log(error);
    // Re-throw the error with the original message if it's our custom error
    if (error.message === "Este viaje ya fue aceptado por otro conductor") {
      throw error;
    }
    throw new Error("Error al confirmar el viaje.");
  }
};

module.exports.startRide = async ({ rideId, otp, captain }) => {
  if (!rideId || !otp) {
    throw new Error("El ID del viaje y OTP son requeridos");
  }

  const ride = await rideModel
    .findOne({
      _id: rideId,
    })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Viaje no encontrado");
  }

  if (ride.status !== "accepted") {
    throw new Error("Viaje no aceptado");
  }

  // MEDIUM-013: Check OTP attempts limit (max 3 attempts)
  const MAX_OTP_ATTEMPTS = 3;
  if (ride.otpAttempts >= MAX_OTP_ATTEMPTS) {
    throw new Error("Demasiados intentos de OTP. Por favor solicite un nuevo viaje.");
  }

  if (ride.otp !== otp) {
    // Increment OTP attempts on failure
    await rideModel.findByIdAndUpdate(rideId, { $inc: { otpAttempts: 1 } });
    throw new Error("OTP inválido");
  }

  // MEDIUM-012: Check OTP expiration
  if (ride.otpExpiresAt && new Date() > ride.otpExpiresAt) {
    throw new Error("OTP expirado. Por favor solicite un nuevo código.");
  }

  await rideModel.findOneAndUpdate(
    {
      _id: rideId,
    },
    {
      status: "ongoing",
    }
  );

  return ride;
};

module.exports.endRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error("El ID del viaje es requerido");
  }

  const ride = await rideModel
    .findOne({
      _id: rideId,
      captain: captain._id,
    })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Viaje no encontrado");
  }

  if (ride.status !== "ongoing") {
    throw new Error("El viaje no está en curso");
  }

  await rideModel.findOneAndUpdate(
    {
      _id: rideId,
    },
    {
      status: "completed",
    }
  );

  return ride;
};
