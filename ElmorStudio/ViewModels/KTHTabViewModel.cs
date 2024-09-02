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
    public SynchronizedProperty<Unit> Unit { get; }
    public SynchronizedProperty<Speed> Speed { get; }
    public string FirmwareVersion { get; private set; }
    public string UID { get; private set; }

    public ReactiveCommand<System.Reactive.Unit, System.Reactive.Unit> SubmitCommand { get; }
    public KthTabViewModel(IKth kth)
    {
        _kth = kth;
        FirmwareVersion = _kth.ReadFirmwareVersion().ToString("X4");
        UID = _kth.ReadUniqueId().ToString();
        Unit = new SynchronizedProperty<Unit>(
            kth.ReadUnit(),
            _kth.WriteUnit
        );
        Speed = new SynchronizedProperty<Speed>(
            kth.ReadSpeed(),
            _kth.WriteSpeed
        );

        var canSubmit = this.WhenAnyValue(
            x => x.Unit.HasChanged,
            x => x.Speed.HasChanged,
            (unit, speed) => unit || speed
        );

        SubmitCommand = ReactiveCommand.Create(
            () =>
            {
                Unit.UpdateStoredValue();
                Speed.UpdateStoredValue();
            },
            canSubmit
        );
    }
}