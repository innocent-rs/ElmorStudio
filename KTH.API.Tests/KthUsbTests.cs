namespace KTH.API.Tests;
public class KthUsbTests
{
    private IKth _kth;
    [SetUp]
    public void Setup()
    {
        var port = KthFactory.FindAllPorts().FirstOrDefault();
        Assert.That(port, Is.Not.Null);
        _kth = KthFactory.CreateKth(port);
    }
    
    [TearDown]
    public void TearDown()
    {
        _kth.Dispose();
    }

    [TestCaseSource(nameof(GetTestCases))]
    public void Test_KthMethods(Func<IKth, object> methodToTest, object expected)
    {
        var actual = methodToTest.Invoke(_kth);
        Assert.That(actual, Is.EqualTo(expected));
    }
    
    public static IEnumerable<TestCaseData> GetTestCases()
    {
        yield return new TestCaseData(new Func<IKth, object>(k => k.ReadWelcome()), "ElmorLabs KTH-USB\0").SetName("Test_Welcome");
        yield return new TestCaseData(new Func<IKth, object>(k => k.ReadDeviceId()), 0xEE0D).SetName("Test_ReadDeviceId");
        var expectedUniqueId = new UniqueId(new byte[] { 0x33, 0x30, 0x47, 0x05, 0x31, 0x36, 0x36, 0x31, 0x40, 0x00, 0x4F, 0x00 });
        yield return new TestCaseData(new Func<IKth, object>(k => k.ReadUniqueId()), expectedUniqueId).SetName("Test_ReadUniqueId");
        yield return new TestCaseData(new Func<IKth, object>(k => k.ReadFirmwareVersion()), 0x05).SetName("Test_Firmware");
        
        yield return new TestCaseData(new Func<IKth, object>(k => k.ReadTc1()), -2614).SetName("Test_ReadTc1");
        yield return new TestCaseData(new Func<IKth, object>(k => k.ReadTc2()), -2614).SetName("Test_ReadTc2");
        //Seems to be variable - exclude from them 'till I can include ranges (it's pointless anyway)
        //yield return new TestCaseData(new Func<IKth, object>(k => k.ReadVdd()), 2996066).SetName("Test_ReadVdd");
        //yield return new TestCaseData(new Func<IKth, object>(k => k.ReadTh1()), 31346).SetName("Test_ReadTh1");
        //yield return new TestCaseData(new Func<IKth, object>(k => k.ReadTh2()), 65360).SetName("Test_ReadTh2");
        
        yield return new TestCaseData(new Func<IKth, object>(k => k.ReadAutoOff()), 8).SetName("Test_ReadAutoOff");
        yield return new TestCaseData(new Func<IKth, object>(k => k.ReadUnit()), Unit.Celsius).SetName("Test_ReadUnit");
        yield return new TestCaseData(new Func<IKth, object>(k => k.ReadCalibrationProfile()), CalibrationProfile.Factory).SetName("Test_ReadCalibrationProfile");
    }

    [Test]
    public void Test_UnitChange()
    {
        try
        {
            var unit = _kth.ReadUnit();
            Assert.That(unit, Is.EqualTo(Unit.Celsius));

            _kth.WriteUnit(Unit.Kelvin);

            Thread.Sleep(1000);

            unit = _kth.ReadUnit();

            Assert.That(unit, Is.EqualTo(Unit.Kelvin));
        }
        finally
        {
            _kth.WriteUnit(Unit.Celsius);
        }
    }
}