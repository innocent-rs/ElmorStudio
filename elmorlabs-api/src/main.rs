use std::io::Read;
use std::time::Duration;
use serialport::{DataBits, Parity, StopBits};
use std::str;
use crate::lib::{AvailableDevice, Device};

mod lib;

fn list_elmor_devices() -> Vec<AvailableDevice> {
    let ports = serialport::available_ports().expect("No ports found");
    let mut devices = vec![];
    
    for port_info in ports {
        if let Ok(mut port) = serialport::new(&port_info.port_name, 9600)
            .parity(Parity::None)
            .stop_bits(StopBits::One)
            .data_bits(DataBits::Eight)
            .timeout(Duration::from_millis(1000))
            .open() {
            port.write(&[0x00u8]).expect("TODO: panic message");
            let mut serial_buf: Vec<u8> = vec![0; 32];
            let mut count = 0;
            loop {
                match port.read(&mut serial_buf[count..]) {
                    Ok(n) if n > 0 => {
                        // Data was successfully read, increment count
                        count += n;
                    }
                    Ok(0) => {
                        // End of stream, no more data to read, break the loop
                        break;
                    }
                    Err(e) => {
                        // Handle the error and break the loop if necessary
                        //eprintln!("Error reading from port: {:?}", e);
                        break;
                    }
                    _ => {}
                }
            }
            println!("Read {count}");
            if let Ok(ascii_str) = str::from_utf8(&serial_buf[..count]) {
                // Successfully converted the buffer to a string
                let device = match ascii_str {
                    "ElmorLabs KTH-USB\0" => Device::KthUsb,
                    _ => unimplemented!("{} is not complemented", ascii_str)
                };
                devices.push(AvailableDevice::new(device, port_info.port_name.clone()));
            } else {
                // The data in the buffer is not valid UTF-8 (and thus not valid ASCII)
                eprintln!("Error: Buffer contains non-ASCII or invalid UTF-8 data");
            }
        }
    }
    devices
}
fn main() {
    let devices = list_elmor_devices();
    for device in devices {
        println!("{} available on {}", device.device, device.port);
    }
}