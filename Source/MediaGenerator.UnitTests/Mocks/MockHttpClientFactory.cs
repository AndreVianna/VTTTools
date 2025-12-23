namespace VttTools.AssetImageManager.Mocks;

public sealed class MockHttpClientFactory
    : IHttpClientFactory, IDisposable {
    private readonly Queue<byte[]> _imageResponses = new();
    private readonly Queue<string> _jsonResponses = new();
    private readonly List<CapturedRequest> _receivedRequests = [];
    private readonly MockHttpMessageHandler _handler;

    public IReadOnlyList<CapturedRequest> ReceivedRequests => _receivedRequests;

    public MockHttpClientFactory() {
        _handler = new(this);
    }

    public void Dispose() {
        _handler.Dispose();
        GC.SuppressFinalize(this);
    }

    public HttpClient CreateClient(string name) => new(_handler) {
        BaseAddress = new("https://mock.example.com")
    };

    public void EnqueueFakeImage() {
        var fakeImageData = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A };
        _imageResponses.Enqueue(fakeImageData);
    }

    public void EnqueueImageData(byte[] imageData) => _imageResponses.Enqueue(imageData);

    public void EnqueueJsonResponse(string jsonContent) => _jsonResponses.Enqueue(jsonContent);

    public void Reset() {
        _imageResponses.Clear();
        _jsonResponses.Clear();
        _receivedRequests.Clear();
    }

    private sealed class MockHttpMessageHandler(MockHttpClientFactory factory) : HttpMessageHandler {
        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) {
            var capturedRequest = await CapturedRequest.FromHttpRequestMessageAsync(request);
            factory._receivedRequests.Add(capturedRequest);

            if (factory._jsonResponses.Count > 0) {
                var jsonContent = factory._jsonResponses.Dequeue();
                return new(HttpStatusCode.OK) {
                    Content = new StringContent(jsonContent, System.Text.Encoding.UTF8, "application/json")
                };
            }

            if (factory._imageResponses.Count > 0) {
                var imageData = factory._imageResponses.Dequeue();
                return new(HttpStatusCode.OK) {
                    Content = new ByteArrayContent(imageData)
                };
            }

            return new(HttpStatusCode.OK) {
                Content = new ByteArrayContent([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
            };
        }
    }

    public sealed record CapturedRequest {
        public string? Prompt { get; init; }
        public string? NegativePrompt { get; init; }
        public string? Model { get; init; }
        public string? AspectRatio { get; init; }
        public HttpMethod Method { get; init; } = HttpMethod.Get;
        public Uri? RequestUri { get; init; }

        public static async Task<CapturedRequest> FromHttpRequestMessageAsync(HttpRequestMessage request) {
            var captured = new CapturedRequest {
                Method = request.Method,
                RequestUri = request.RequestUri
            };

            if (request.Content is MultipartFormDataContent multipart) {
                var formData = new Dictionary<string, string>();

                foreach (var part in multipart) {
                    if (part.Headers.ContentDisposition?.Name is { } name) {
                        var fieldName = name.Trim('"');
                        var value = await part.ReadAsStringAsync();
                        formData[fieldName] = value;
                    }
                }

                return captured with {
                    Prompt = formData.GetValueOrDefault("prompt"),
                    NegativePrompt = formData.GetValueOrDefault("negative_prompt"),
                    Model = formData.GetValueOrDefault("model"),
                    AspectRatio = formData.GetValueOrDefault("aspect_ratio")
                };
            }

            return captured;
        }
    }
}