use std::sync::Mutex;
use serde::{Deserialize, Serialize};
use tauri::{Manager, State};

#[tauri::command]
fn get_groups(state: State<'_, Mutex<StudioState>>) -> Vec<Group> {
    let state = state.lock().unwrap();
    state.groups.clone()
}

#[tauri::command]
fn remove_group(id: u32, state: State<'_, Mutex<StudioState>>) ->  Vec<Group> {
    let mut state = state.lock().unwrap();
    state.groups.retain(|group| group.id != id); // Remove the group with the specified id
    state.groups.clone() // Return the updated list of groups
}

#[derive(Serialize, Deserialize, Clone)]
enum DeviceKind {
    KTHUsb,
}

#[derive(Serialize, Deserialize, Clone)]
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

#[derive(Serialize, Deserialize, Clone)]
struct Group {
    id: u32,
    name: String,
    devices: Vec<Device>
}

#[derive(Default)]
struct StudioState {
    groups: Vec<Group>
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let group1 = Group {
                id: 1,
                name: "Group 1".to_string(),
                devices: vec![
                    Device::new(1, DeviceKind::KTHUsb, "COM3".to_string(), 0x5),
                    Device::new(2, DeviceKind::KTHUsb, "COM4".to_string(), 0x5),
                ]
            };
            let group2 = Group {
                id: 2,
                name: "Ungrouped".to_string(),
                devices: vec![
                    Device::new(3, DeviceKind::KTHUsb, "COM5".to_string(), 0x5)
                ]
            };
            let state = StudioState {
                groups: vec![group1, group2]
            };
            
            app.manage(Mutex::new(state));
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_groups, remove_group])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
