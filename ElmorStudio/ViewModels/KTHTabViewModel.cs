using System;
using KTH.API;
//using KTH.API;
using ReactiveUI;

namespace ElmorStudio.ViewModels;

public class KthTabViewModel : ReactiveObject
{
    public static Unit[] Units => (Unit[])Enum.GetValues(typeof(Unit));
    public static Speed[] Speeds => (Speed[])Enum.GetValues(typeof(Speed));
    
    private readonly IKth _kth;
    private Unit _unit;
    private Unit _kthUnit;
    private Speed _speed;
    private Speed _kthSpeed;
    public string FirmwareVersion { get; }
    public string UID { get; }

    public Unit Unit
    {
        get => _unit;
        set => this.RaiseAndSetIfChanged(ref _unit, value);
    }

    public Speed Speed
    {
        get => _speed;
        set => this.RaiseAndSetIfChanged(ref _speed, value);
    }

    public ReactiveCommand<System.Reactive.Unit, System.Reactive.Unit> SubmitCommand { get; }
    public KthTabViewModel(IKth kth)
    {
        _kth = kth;
        FirmwareVersion = kth.ReadFirmwareVersion().ToString("X4");
        UID = kth.ReadUniqueId().ToString();
        _kthUnit = Unit = kth.ReadUnit();
        _kthSpeed = Speed = kth.ReadSpeed();
        var canSubmit = this.WhenAnyValue(
            x => x.Unit,
            x => x.Speed,
            (unit, speed) => unit != _kthUnit || speed != _kthSpeed
        );
        SubmitCommand = ReactiveCommand.Create(
            () => { Console.WriteLine("Hello"); },
            canSubmit
        );
    }
}