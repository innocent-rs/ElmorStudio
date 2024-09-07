use serde::{Deserialize, Serialize};

#[tauri::command]
fn get_devices() -> Vec<Device> {
    vec![
        Device::new(1, DeviceKind::KTHUsb, "COM3".to_string(), 0x5),
        Device::new(2, DeviceKind::KTHUsb, "COM4".to_string(), 0x5),
        Device::new(3, DeviceKind::KTHUsb, "COM5".to_string(), 0x5)
    ]
}

#[derive(Serialize, Deserialize)]
enum DeviceKind {
    KTHUsb,
}

#[derive(Serialize, Deserialize)]
struct Device {
    id: u32,
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_devices])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
