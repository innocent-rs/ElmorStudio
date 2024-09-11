use std::sync::Mutex;
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::devices::Device;
use crate::state::StudioState;

#[derive(Serialize, Deserialize, Clone)]
pub(crate) struct Group {
    id: u32,
    name: String,
    devices: Vec<Device>,
    is_locked: bool,
}

impl Group {
    pub fn new(id: u32, name: String, devices: Vec<Device>, is_locked: bool) -> Self {
        Group { id, name, devices, is_locked }
    }
}

#[tauri::command]
pub(crate) fn groups_fetch(state: State<'_, Mutex<StudioState>>) -> Vec<Group> {
    let state = state.lock().unwrap();
    state.groups.clone()
}
#[tauri::command]
pub(crate) fn group_create(state: State<'_, Mutex<StudioState>>) -> Vec<Group> {
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
pub(crate) fn group_lock_unlock(group_id: u32, lock: bool, state: State<'_, Mutex<StudioState>>) -> Vec<Group> {
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
pub(crate) fn group_rename(group_id: u32, new_name: String, state: State<'_, Mutex<crate::StudioState>>) -> Vec<crate::Group> {
    let mut state = state.lock().unwrap();

    // Find the group with the specified id
    if let Some(group) = state.groups.iter_mut().find(|group| group.id == group_id) {
        // Check if the group is locked
        if group.is_locked {
            // If the group is locked, panic with a custom message
            panic!("Cannot rename a locked group!");
        }

        // Rename the group if it's not locked
        group.name = new_name;
    }

    // Return the updated list of groups
    state.groups.clone()
}
#[tauri::command]
pub(crate) fn group_delete(group_id: u32, state: State<'_, Mutex<StudioState>>) ->  Vec<Group> {
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
        group_remove_from(group_id, device_id, state.clone());
    }

    state.lock().unwrap().groups.retain(|group| group.id != group_id);

    state.lock().unwrap().groups.sort_by(|a, b| b.id.cmp(&a.id));
    // Return the updated list of groups
    state.lock().unwrap().groups.clone()
}
#[tauri::command]
pub(crate) fn group_remove_from(group_id: u32, device_id: u32, state: State<'_, Mutex<StudioState>>) -> Vec<Group> {
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

#[tauri::command]
pub(crate) fn group_move_device_to(
    source_group_id: u32,
    target_group_id: u32,
    device_id: u32,
    state: State<'_, Mutex<StudioState>>,
) -> Vec<Group> {
    let mut state = state.lock().unwrap();

    // Find the source group by id
    if let Some(mut source_group) = state.groups.iter_mut().find(|group| group.id == source_group_id) {
        // Find the device in the source group
        if let Some(device_index) = source_group.devices.iter().position(|device| device.id == device_id) {
            // Remove the device from the source group
            let device = source_group.devices.remove(device_index);

            // Find or create the target group
            if let Some(target_group) = state.groups.iter_mut().find(|group| group.id == target_group_id) {
                // Add the device to the target group
                target_group.devices.push(device);
            } else {
                // If the target group does not exist, create it
                let new_group = Group {
                    id: target_group_id,
                    name: format!("Group {}", target_group_id),
                    devices: vec![device],
                    is_locked: false,
                };
                state.groups.push(new_group);
            }
        }
    }

    // Return the updated list of groups
    state.groups.clone()
}