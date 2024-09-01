using Avalonia;
using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using ElmorStudio.ViewModels;

namespace ElmorStudio.Views;

public partial class KTHTab : UserControl
{
    public KTHTab(KthTabViewModel viewModel)
    {
        InitializeComponent();
        DataContext = viewModel;
    }
}