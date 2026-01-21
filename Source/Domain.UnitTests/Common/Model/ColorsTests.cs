namespace VttTools.Common.Model;

public class ColorsTests {
    [Fact]
    public void Primary_ReturnsCorrectValue() => Colors.Primary.Should().Be("#0d6efd");

    [Fact]
    public void Secondary_ReturnsCorrectValue() => Colors.Secondary.Should().Be("#6c757d");

    [Fact]
    public void Success_ReturnsCorrectValue() => Colors.Success.Should().Be("#198754");

    [Fact]
    public void Information_ReturnsCorrectValue() => Colors.Information.Should().Be("#0dc9f0");

    [Fact]
    public void Warning_ReturnsCorrectValue() => Colors.Warning.Should().Be("#ffc107");

    [Fact]
    public void Danger_ReturnsCorrectValue() => Colors.Danger.Should().Be("#dc3545");

    [Fact]
    public void Light_ReturnsCorrectValue() => Colors.Light.Should().Be("#f8f9fa");

    [Fact]
    public void Dark_ReturnsCorrectValue() => Colors.Dark.Should().Be("#212529");

    [Fact]
    public void Blue_ReturnsCorrectValue() => Colors.Blue.Should().Be("#0d6efd");

    [Fact]
    public void Indigo_ReturnsCorrectValue() => Colors.Indigo.Should().Be("#6610f2");

    [Fact]
    public void Purple_ReturnsCorrectValue() => Colors.Purple.Should().Be("#6f42c1");

    [Fact]
    public void Pink_ReturnsCorrectValue() => Colors.Pink.Should().Be("#d63384");

    [Fact]
    public void Red_ReturnsCorrectValue() => Colors.Red.Should().Be("#dc3545");

    [Fact]
    public void Orange_ReturnsCorrectValue() => Colors.Orange.Should().Be("#fd7e14");

    [Fact]
    public void Yellow_ReturnsCorrectValue() => Colors.Yellow.Should().Be("#ffc107");

    [Fact]
    public void Green_ReturnsCorrectValue() => Colors.Green.Should().Be("#198754");

    [Fact]
    public void Teal_ReturnsCorrectValue() => Colors.Teal.Should().Be("#20c997");

    [Fact]
    public void Cyan_ReturnsCorrectValue() => Colors.Cyan.Should().Be("#0dcaf0");

    [Fact]
    public void White_ReturnsCorrectValue() => Colors.White.Should().Be("#ffffff");

    [Fact]
    public void Black_ReturnsCorrectValue() => Colors.Black.Should().Be("#000000");

    [Fact]
    public void Gray_ReturnsCorrectValue() => Colors.Gray.Should().Be("#6c757d");

    [Fact]
    public void GrayDark_ReturnsCorrectValue() => Colors.GrayDark.Should().Be("#343a40");

    [Fact]
    public void Transparent_ReturnsCorrectValue() => Colors.Transparent.Should().Be("#00000000");
}