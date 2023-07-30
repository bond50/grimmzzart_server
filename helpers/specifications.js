const tvSpecificationSchema = new Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  size: { type: Number, required: true }, // In inches
  type: { type: String, required: true }, // Such as LED, OLED, QLED, Plasma, etc.
  resolution: { type: String, required: true }, // Such as 4K, Full HD, HD, 8K etc.
  smartTv: { type: Boolean, required: true }, // Is it a smart TV?
  ports: {
    hdmi: { type: Number, required: true },
    usb: { type: Number, required: true },
  },
  features: {
    hdr: { type: Boolean, required: true }, // HDR Support
    wifi: { type: Boolean, required: true }, // Wifi Connectivity
    bluetooth: { type: Boolean, required: true }, // Bluetooth Support
  },
  price: { type: Number, required: true },
});
