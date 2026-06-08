# Script to deploy the auth-email-hook edge function

Write-Host "Deploying the Supabase Edge Function..."
npx supabase functions deploy auth-email-hook

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "Deployment failed. Ensure you are logged in to Supabase CLI and your project is linked." -ForegroundColor Red
    Write-Host "To login, run: npx supabase login"
    Write-Host "To link, run: npx supabase link --project-ref your_project_ref"
}
