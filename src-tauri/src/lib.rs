use std::sync::Mutex;
use serde::{Deserialize, Serialize};
use tauri::{Manager, State};

#[tauri::command]
fn get_groups(state: State<'_, Mutex<StudioState>>) -> Vec<Group> {
    let state = state.lock().unwrap();
    state.groups.clone()
}
#[tauri::command]
fn create_group(state: State<'_, Mutex<StudioState>>) -> Vec<Group> {
    let mut state = state.lock().unwrap();

    // Find the maximum id in the existing groups
    let new_id = state.groups.iter().map(|group| group.id).max().unwrap_or(0) + 1;

    // Create a new group
    let new_group = Group {
        id: new_id,
        name: format!("Group {}", new_id),
        devices: vec![], // Empty list of devices
        is_locked: false
    };

    // Add the new group to the state
    state.groups.push(new_group);

    state.groups.sort_by(|a, b| b.id.cmp(&a.id));
    // Return the updated list of groups
    state.groups.clone()
}

#[tauri::command]
fn lock_unlock_group(group_id: u32, lock: bool, state: State<'_, Mutex<StudioState>>) -> Vec<Group> {
    let mut state = state.lock().unwrap();

    // Find the group with the given id
    if let Some(group) = state.groups.iter_mut().find(|group| group.id == group_id) {
        // Update the lock status based on the passed boolean value
        group.is_locked = lock;
    }

    // Return the updated list of groups
    state.groups.clone()
}
#[tauri::command]
fn remove_group(group_id: u32, state: State<'_, Mutex<StudioState>>) ->  Vec<Group> {
/*    let mut state = state2.lock().unwrap();
    if let Some(group) = state.groups.iter().find(|group| group.id == group_id) {
        // Move all devices to the default group (id = 0)
        for device in group.devices.clone() {
            // Use the remove_from_group function to move each device to the default group
            remove_from_group(group_id, device.id, state2.clone());
        }
    }

    // Remove the group with the specified id
    state.groups.retain(|group| group.id != group_id);
    state.groups.clone()*/
    let mut devices_to_move = vec![];

    {
        // Acquire the lock to access the groups
        let mut state = state.lock().unwrap();

        // Find the group with the specified id
        if let Some(group) = state.groups.iter().find(|group| group.id == group_id) {
            // Collect all device ids from the group that is being removed
            devices_to_move = group.devices.iter().map(|device| device.id).collect::<Vec<u32>>();
        }

        // Remove the group with the specified id
        //state.groups.retain(|group| group.id != group_id);
    }

    // Now move the devices to the default group outside of the lock
    for device_id in devices_to_move {
        remove_from_group(group_id, device_id, state.clone());
    }
    
    state.lock().unwrap().groups.retain(|group| group.id != group_id);

    state.lock().unwrap().groups.sort_by(|a, b| b.id.cmp(&a.id));
    // Return the updated list of groups
    state.lock().unwrap().groups.clone()
}
#[tauri::command] 
fn remove_from_group(group_id: u32, device_id: u32, state: State<'_, Mutex<StudioState>>) -> Vec<Group> {
    let mut state = state.lock().unwrap();
    if let Some(mut group) = state.groups.iter_mut().find(|group| group.id == group_id) {
        if let Some(device_index) = group.devices.iter().position(|device| device.id == device_id) {
            let device = group.devices.remove(device_index);

            // Find or create the default group with id 0
            if let Some(default_group) = state.groups.iter_mut().find(|group| group.id == 0) {
                // Add the device to the default group
                default_group.devices.push(device);
            } else {
                // If the default group does not exist, create it
                let default_group = Group {
                    id: 0,
                    name: "Default Group".to_string(),
                    devices: vec![device],
                    is_locked: false
                };
                state.groups.push(default_group);
            }
        }
    }

    state.groups.clone()
}

#[derive(Serialize, Deserialize, Clone) ]
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
    devices: Vec<Device>,
    is_locked: bool,
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
                ],
                is_locked: false,
            };
            let group2 = Group {
                id: 0,
                name: "Ungrouped".to_string(),
                devices: vec![
                    Device::new(3, DeviceKind::KTHUsb, "COM5".to_string(), 0x5)
                ],
                is_locked: false
            };
            let state = StudioState {
                groups: vec![group1, group2]
            };
            
            app.manage(Mutex::new(state));
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_groups, remove_group, create_group, lock_unlock_group])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
