namespace VttTools.AI.Providers.OpenAi;

internal sealed record OpenAiPricingCalculator(double InputCostPerM, double OutputCostPerM) {
    public GenerationCost Calculate(int inputTokens, int outputTokens) {
        var inputCost = InputCostPerM * inputTokens / 1000000.0;
        var outputCost = OutputCostPerM * outputTokens / 1000000.0;
        return new GenerationCost(inputTokens, inputCost, outputTokens, outputCost, inputTokens + outputTokens, inputCost + outputCost);
    }
}