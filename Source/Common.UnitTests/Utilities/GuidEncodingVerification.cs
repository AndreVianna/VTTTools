namespace VttTools.Common.UnitTests.Utilities;

/// <summary>
/// C# test to generate expected base64url values for frontend GUID encoding tests.
/// Run this to verify frontend encoding matches .NET Guid.ToByteArray() format.
/// </summary>
public class GuidEncodingVerification {
    [Fact]
    public void GenerateExpectedBase64UrlValues() {
        // Test cases from frontend enhancedBaseQuery.test.ts
        var testCases = new[] {
            new Guid("019639ea-c7de-7a01-8548-41edfccde206"),  // User ID
            new Guid("0199bf66-76d7-7e4a-9398-8022839c7d80"),  // Asset ID
            new Guid("00000000-0000-0000-0000-000000000000"),  // Empty GUID
            new Guid("ffffffff-ffff-ffff-ffff-ffffffffffff")   // Max GUID
        };

        foreach (var guid in testCases) {
            var bytes = guid.ToByteArray();
            var base64 = Convert.ToBase64String(bytes);
            var base64Url = base64.Replace('+', '-').Replace('/', '_').TrimEnd('=');

            Console.WriteLine($"GUID: {guid}");
            Console.WriteLine($"Bytes: [{string.Join(", ", bytes.Select(b => $"0x{b:X2}"))}]");
            Console.WriteLine($"Base64URL: {base64Url}");
            Console.WriteLine("TypeScript test case:");
            Console.WriteLine($"  {{ guid: '{guid}', expectedBase64Url: '{base64Url}' }},");
            Console.WriteLine();
        }
    }

    [Theory]
    [InlineData("019639ea-c7de-7a01-8548-41edfccde206", "6jmWAd7HAXqFSEHt_M3iBg")]
    [InlineData("0199bf66-76d7-7e4a-9398-8022839c7d80", "Zr-ZAdf2Sn6TmIAig5x9gA")]
    public void VerifyExpectedBase64UrlValues(string guidString, string expectedBase64Url) {
        // Verify the expected values used in frontend tests are correct
        var guid = new Guid(guidString);
        var bytes = guid.ToByteArray();
        var base64 = Convert.ToBase64String(bytes);
        var actualBase64Url = base64.Replace('+', '-').Replace('/', '_').TrimEnd('=');

        actualBase64Url.Should().Be(expectedBase64Url,
            $"Frontend expected value for {guidString} should match .NET encoding");
    }
}