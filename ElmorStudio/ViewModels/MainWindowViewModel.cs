using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using ElmorStudio.Views;
using KTH.API;

namespace ElmorStudio.ViewModels;
public class TabItemViewModel : ViewModelBase
{
    public string Header { get; set; }
    public object Content { get; set; }
}
public partial class MainWindowViewModel : ViewModelBase, IDisposable
{
    public ObservableCollection<TabItemViewModel> Tabs { get; }
    private List<IDisposable> _disposables;
    
    public MainWindowViewModel()
    {
        Tabs = new ObservableCollection<TabItemViewModel>();
        _disposables = new List<IDisposable>();
        var port = KthFactory.FindAllPorts().First();
        var kth = KthFactory.CreateKth(port);
        _disposables.Add(kth);
        var welcome = kth.ReadFirmwareVersion();
        Console.WriteLine(welcome);
        // Add some initial tabs
        var tab = new KTHTab(new KthTabViewModel(kth));
        Tabs.Add(new TabItemViewModel { Header = "Tab 1", Content = tab });
        //Tabs.Add(new TabItemViewModel { Header = "Tab 2", Content = "Content for Tab 2" });
    }

    // Method to add a new tab
    public void AddTab(string header, object content)
    {
        Tabs.Add(new TabItemViewModel { Header = header, Content = content });
    }

    // Method to remove a tab
    public void RemoveTab(TabItemViewModel tab)
    {
        Tabs.Remove(tab);
    }
    public void Dispose()
    {
        foreach (var disposable in _disposables)
        {
            disposable.Dispose();
        }
    }
}