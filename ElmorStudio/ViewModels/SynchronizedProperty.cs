using System;
using System.Collections.Generic;
using ReactiveUI;

namespace ElmorStudio.ViewModels;

public class SynchronizedProperty<T> : ReactiveObject
{
    private T _uiValue;
    private T _storedValue;
    private readonly Action<T> _updateAction;

    public SynchronizedProperty(T initialValue, Action<T> updateAction)
    {
        _uiValue = _storedValue = initialValue;
        _updateAction = updateAction;
    }

    public T UiValue
    {
        get => _uiValue;
        set
        {
            this.RaiseAndSetIfChanged(ref _uiValue, value);
            this.RaisePropertyChanged(nameof(HasChanged));
        }
    }

    public T StoredValue
    {
        get => _storedValue;
        private set
        {
            this.RaiseAndSetIfChanged(ref _storedValue, value);
            this.RaisePropertyChanged(nameof(HasChanged));
        }
    }

    public bool HasChanged => !EqualityComparer<T>.Default.Equals(_uiValue, _storedValue);

    public void UpdateStoredValue()
    {
        if (HasChanged)
        {
            _updateAction(_uiValue);
            StoredValue = _uiValue;
        }
    }
}