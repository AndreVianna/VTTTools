namespace VttTools.AI.Model;

internal sealed record GenerationCost(int InputTokens, double InputCost, int OutputTokens, double OutputCost, int TotalTokens, double TotalCost);
