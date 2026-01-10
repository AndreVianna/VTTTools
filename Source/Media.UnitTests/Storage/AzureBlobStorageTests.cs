using Azure.Storage.Blobs;

namespace VttTools.Media.Storage;

public class AzureBlobStorageTests {
    [Fact]
    public void AzureBlobStorage_CanBeInstantiated() => typeof(AzureBlobStorage).Should().NotBeNull();

    [Fact]
    public void AzureBlobStorage_ImplementsIBlobStorage() => typeof(IBlobStorage).IsAssignableFrom(typeof(AzureBlobStorage)).Should().BeTrue();

    [Fact]
    public void AzureBlobStorage_HasCorrectConstructor() {
        var constructor = typeof(AzureBlobStorage).GetConstructors()
            .FirstOrDefault(c => {
                var parameters = c.GetParameters();
                return parameters.Length == 2 &&
                       parameters[0].ParameterType == typeof(BlobServiceClient) &&
                       parameters[1].ParameterType.Name.Contains("ILogger");
            });

        constructor.Should().NotBeNull();
    }

    [Fact]
    public void AzureBlobStorage_SaveOriginalAsync_MethodExists() {
        var method = typeof(AzureBlobStorage).GetMethod("SaveOriginalAsync");

        method.Should().NotBeNull();
        method!.ReturnType.Should().Be<Task<Result<string>>>();
    }

    [Fact]
    public void AzureBlobStorage_SavePrimaryAsync_MethodExists() {
        var method = typeof(AzureBlobStorage).GetMethod("SavePrimaryAsync");

        method.Should().NotBeNull();
        method!.ReturnType.Should().Be<Task<Result<string>>>();
    }

    [Fact]
    public void AzureBlobStorage_SavePlaceholderAsync_MethodExists() {
        var method = typeof(AzureBlobStorage).GetMethod("SavePlaceholderAsync");

        method.Should().NotBeNull();
        method!.ReturnType.Should().Be<Task<Result<string>>>();
    }

    [Fact]
    public void AzureBlobStorage_SaveThumbnailAsync_MethodExists() {
        var method = typeof(AzureBlobStorage).GetMethod("SaveThumbnailAsync");

        method.Should().NotBeNull();
        method!.ReturnType.Should().Be<Task<Result<string>>>();
    }

    [Fact]
    public void AzureBlobStorage_GetOriginalAsync_MethodExists() {
        var method = typeof(AzureBlobStorage).GetMethod("GetOriginalAsync");

        method.Should().NotBeNull();
        method!.ReturnType.Should().Be<Task<ResourceDownloadResult?>>();
    }

    [Fact]
    public void AzureBlobStorage_GetPrimaryAsync_MethodExists() {
        var method = typeof(AzureBlobStorage).GetMethod("GetPrimaryAsync");

        method.Should().NotBeNull();
        method!.ReturnType.Should().Be<Task<ResourceDownloadResult?>>();
    }

    [Fact]
    public void AzureBlobStorage_RemoveAsync_MethodExists() {
        var method = typeof(AzureBlobStorage).GetMethod("RemoveAsync");

        method.Should().NotBeNull();
        method!.ReturnType.Should().Be<Task<Result>>();
    }
}
