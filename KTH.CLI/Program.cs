// See https://aka.ms/new-console-template for more information

using System.IO.Ports;
using KTH.API;

var ports = KthFactory.FindAllPorts();

// Display each port name
Console.WriteLine("Available Serial Ports:");
foreach (var port in ports)
{
    Console.WriteLine(port);
    var kth = KthFactory.CreateKth(port);
    var welcome = kth.ReadWelcome();
    var deviceId = kth.ReadDeviceId();
    var uniqueId = kth.ReadUniqueId();
    var firmware = kth.ReadFirmwareVersion();
    Console.WriteLine($"Welcome={welcome}, DeviceId=0x{deviceId:X}, UniqueId={uniqueId}, Firmware=0x{firmware:X4}");

    var vdd = kth.ReadVdd();
    Console.WriteLine($"Vdd={vdd}");
    var autoOff = kth.ReadAutoOff();
    var unit = kth.ReadUnit();
    var speed = kth.ReadSpeed();
    var calibrationProfile = kth.ReadCalibrationProfile();
    Console.WriteLine($"AutoOff={autoOff*3.75}, Unit={unit}, Speed={speed}, CalibrationProfile={calibrationProfile}");
    while (true)
    {
        var tc1 = kth.ReadTc1();
        var tc2 = kth.ReadTc2();
        Console.WriteLine(tc1 / 10.0f + ";" +  tc2 / 10.0f);
        Thread.Sleep(250);
    }
}