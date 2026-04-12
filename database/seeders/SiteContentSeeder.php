<?php

namespace Database\Seeders;

use App\Models\SiteContent;
use Illuminate\Database\Seeder;

class SiteContentSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            'home' => [
                'title' => 'Samuh',
                'subtitle' => 'Group savings and accounting for cooperatives',
                'body' => "Welcome to Samuh.\n\nManage member savings, loans, and monthly deposits in one place. Company teams use the portal; platform staff manage organizations from the admin panel.\n\nEdit this text under Admin → Website → Pages & content.",
            ],
            'about' => [
                'title' => 'About Samuh',
                'subtitle' => 'Built for savings groups and cooperatives',
                'body' => "Samuh helps organizations run transparent group finances.\n\nFeatures include multi-company support, role-based access, and tools for admins to verify subscriptions before activating a company.\n\nReplace this copy from the admin panel.",
            ],
            'contact' => [
                'title' => 'Contact',
                'subtitle' => 'We are here to help',
                'body' => "Email: support@example.com\nPhone: +1 (555) 000-0000\nHours: Monday–Friday, 9:00–17:00\n\nUpdate these details in Admin → Website → Pages & content.",
            ],
            'prices' => [
                'title' => 'Pricing',
                'subtitle' => 'Simple plans for growing cooperatives',
                'body' => "Starter — essential features for small groups.\nProfessional — full accounting and priority support.\nEnterprise — custom terms and dedicated onboarding.\n\nPublish your real pricing table here from the admin panel.",
            ],
        ];

        foreach ($pages as $slug => $fields) {
            SiteContent::query()->updateOrCreate(
                ['slug' => $slug],
                $fields
            );
        }
    }
}
