namespace ProjectTracker.Api.Services
{
    public static class SubscriptionLimits
    {
        // null = unlimited
        public static int? MaxProjects(string tier)  => tier == "Free" ? 1 : null;
        public static int? MaxClients(string tier)   => tier == "Free" ? 3 : null;
        public static int? MaxInvoices(string tier)  => tier == "Free" ? 3 : null;

        public static bool CanExportPdf(string tier) => tier != "Free";
        public static int? MaxTeamMembers(string tier) => tier == "Team" ? null : tier == "Solo" ? 1 : 1;

        public static string UpgradeMessage(string limitName, int max, string requiredTier = "Solo")
            => $"Free plan is limited to {max} {limitName}. Upgrade to {requiredTier} to add more.";
    }
}
