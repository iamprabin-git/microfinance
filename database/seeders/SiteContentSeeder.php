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
                'meta_description' => 'Samuh helps savings groups and cooperatives run transparent finances with a modern company portal and platform administration.',
                'hero_image' => '/images/marketing/hero-pattern.svg',
                'body' => "Welcome to Samuh.\n\nManage member savings, loans, and monthly deposits in one place. Company teams use the portal; platform staff manage organizations from the admin panel.\n\nEdit this text under Admin → Website → Pages & content.",
            ],
            'about' => [
                'title' => 'About Samuh',
                'subtitle' => 'Built for savings groups and cooperatives',
                'meta_description' => 'Learn how Samuh supports multi-company co-operatives with role-based access and clear accounting workflows.',
                'hero_image' => '/images/marketing/hero-pattern.svg',
                'body' => "Samuh helps organizations run transparent group finances.\n\nFeatures include multi-company support, role-based access, and tools for admins to verify subscriptions before activating a company.\n\nReplace this copy from the admin panel.",
            ],
            'contact' => [
                'title' => 'Contact',
                'subtitle' => 'We are here to help',
                'meta_description' => 'Contact the Samuh team for demos, billing questions, or technical support for your cooperative.',
                'hero_image' => '/images/marketing/hero-pattern.svg',
                'body' => "Email: support@example.com\nPhone: +1 (555) 000-0000\nHours: Monday–Friday, 9:00–17:00\n\nUpdate these details in Admin → Website → Pages & content.",
            ],
            'prices' => [
                'title' => 'Pricing',
                'subtitle' => 'Simple plans for growing cooperatives',
                'meta_description' => 'Compare Samuh plans for small savings groups through to enterprise co-operatives with custom onboarding.',
                'hero_image' => '/images/marketing/hero-pattern.svg',
                'body' => "Starter — essential features for small groups.\nProfessional — full accounting and priority support.\nEnterprise — custom terms and dedicated onboarding.\n\nPublish your real pricing table here from the admin panel.",
            ],
            'features' => [
                'title' => 'Features',
                'subtitle' => 'Everything your co-operative needs in one workspace',
                'meta_description' => 'Explore Samuh features: members, savings, loans, financial statements, and a polished public marketing site.',
                'hero_image' => '/images/marketing/hero-pattern.svg',
                'body' => "Members & groups — onboard members, track contact details, and keep group structures organized.\n\nSavings & loans — record monthly deposits, manage loan schedules, and capture repayments with a clear audit trail.\n\nReporting — export financial statements for committees and regulators.\n\nPublic site — customize pages with titles, descriptions, and hero imagery from the admin panel.\n\nReplace this outline with your own product story.",
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
