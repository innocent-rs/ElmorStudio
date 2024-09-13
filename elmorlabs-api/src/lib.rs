use std::fmt;

pub enum Device {
    KthUsb
}

impl fmt::Display for Device {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Device::KthUsb => write!(f, "KTH-USB"),
        }
    }
}

pub struct AvailableDevice {
    pub device: Device,
    pub port: String
}

impl AvailableDevice {
    pub fn new(device: Device, port: String) -> Self {
        Self { device, port }
    }
}

