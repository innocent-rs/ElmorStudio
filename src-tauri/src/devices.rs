use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone) ]
pub(crate) enum DeviceKind {
    KTHUsb,
}

#[derive(Serialize, Deserialize, Clone)]
pub(crate) struct Device {
    pub id: u32,
    kind: DeviceKind,
    port: String,
    is_open: bool,
    firmware: u16
}
impl Device {
    pub fn new(id: u32, kind: DeviceKind, port: String, firmware: u16) ->  Self {
        Device { id, kind, port, firmware, is_open: true }
    }
}