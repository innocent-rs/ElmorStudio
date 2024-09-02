using System.Collections.Immutable;
using System.IO.Ports;
using Microsoft.Win32;
using System.Management;

namespace KTH.API;

public static class KthFactory
{
    private const string EVC2_PNPID = "USB\\VID_0483&PID_5740&MI_01";
    private static IEnumerable<string> FindCh340Ports()
    {
#if WINDOWS
        using var masterRegKey = Registry.LocalMachine.OpenSubKey(@"SYSTEM\CurrentControlSet\Enum\USB\VID_1A86&PID_7523");
        if (masterRegKey == null) yield break;
        foreach (var subKey in masterRegKey.GetSubKeyNames())
        {
            using var subRegKey = masterRegKey.OpenSubKey($"{subKey}\\Device Parameters");
            if (subRegKey?.GetValueKind("PortName") != RegistryValueKind.String) continue;
            var portName = subRegKey.GetValue("PortName") as string;
            if (!string.IsNullOrEmpty(portName))
            {
                yield return portName;
            }
        }
#endif
    }
    public static IEnumerable<AvailablePort> FindAllPorts()
    {
        //static IEnumerable<string> 
        var serialPorts = SerialPort.GetPortNames().ToList();
        // Identify CH340 ports from the registry
        var ch340Ports = FindCh340Ports().ToImmutableHashSet();
        // Query all serial ports and match them with descriptions
        using var searcher = new ManagementObjectSearcher("SELECT * FROM WIN32_SerialPort");
        var managementObjects = searcher.Get().Cast<ManagementObject>().ToList();

        foreach (var port in serialPorts)
        {
            if (ch340Ports.Contains(port))
            {
                yield return new AvailablePort(port, "CH340 Serial Port");
            }
            else
            {
                var queryObj = managementObjects.FirstOrDefault(mo => mo["DeviceID"].ToString() == port);
                if (queryObj == null)
                {
                    yield return new AvailablePort(port, "Unknown Serial Port");
                    continue;
                }
                
                var pnpDevId = queryObj["PNPDeviceID"].ToString();
                if (pnpDevId.StartsWith(EVC2_PNPID))
                {
                    yield return new AvailablePort(pnpDevId, "EVC2 Serial Port");
                }
                else
                {
                    yield return new AvailablePort(pnpDevId, queryObj["Description"].ToString());
                }
            }
        }
    }

    public static IKth CreateKth(AvailablePort port)
    {
        var serialPort = new SerialPort(port.PortName);
        serialPort.BaudRate = 9600;
        serialPort.Parity = Parity.None;
        serialPort.StopBits = StopBits.One;
        serialPort.DataBits = 8;

        serialPort.Handshake = Handshake.None;
        serialPort.ReadTimeout = 1000;
        serialPort.WriteTimeout = 1000;

        serialPort.WriteBufferSize = 512;
        serialPort.ReadBufferSize = 512;
        serialPort.Open();
        var device = new SerialPortDevice(serialPort);
        return new Kth(device);
    }
}