<?php

namespace Database\Seeders;

use App\Models\Committee;
use App\Models\Concern;
use App\Models\Event;
use App\Models\FeedItem;
use App\Models\Officer;
use App\Models\Organization;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Demo data so the dashboards have something to show when presenting.
 * Run: php artisan db:seed --class=CouncilDemoSeeder   (password for every account: "password")
 *
 * ASSUMPTIONS - I don't have your users/organizations/officers migrations, so this only sets the
 * columns the rest of the code relies on (users: name/email/password; organizations: name/is_council;
 * officers: user_id/organization_id/position). If those tables have other NOT NULL columns
 * (department, tag, term dates, ...) add them where marked.
 */
class CouncilDemoSeeder extends Seeder
{
    public function run(): void
    {
        $orgs = collect(['SSC', 'CRIM', 'LOTES', 'BYTE', 'COHME', 'Campus Ministry'])->mapWithKeys(
            fn ($name) => [$name => Organization::firstOrCreate(['name' => $name], ['is_council' => $name === 'SSC'])]
        );

        $mk = fn (string $name, string $email) => User::firstOrCreate(
            ['email' => $email],
            ['name' => $name, 'password' => Hash::make('password'), 'email_verified_at' => now()]
        );

        // --- People ---------------------------------------------------------
        $ssc = $mk('Alex Rivera', 'ssc.president@demo.test');          // SSC President  (sees everything)
        $byte = $mk('Marcus Vance', 'byte.president@demo.test');       // BYTE President (BYTE only)
        $officer = $mk('Alex Mercer', 'officer@demo.test');            // BYTE committee officer
        $students = collect([['Sarah Jenkins', 's1'], ['Mark Ramirez', 's2'], ['David Chen', 's3'], ['Lisa M.', 's4']])
            ->map(fn ($s) => $mk($s[0], "{$s[1]}@demo.test"));

        $sscOfficer = Officer::firstOrCreate(['user_id' => $ssc->id], ['organization_id' => $orgs['SSC']->id, 'position' => 'President']);
        $byteOfficer = Officer::firstOrCreate(['user_id' => $byte->id], ['organization_id' => $orgs['BYTE']->id, 'position' => 'President']);
        $committeeOfficer = Officer::firstOrCreate(['user_id' => $officer->id], ['organization_id' => $orgs['BYTE']->id, 'position' => 'Committee Head']);

        // Memberships (officer is also a student; students can join several orgs)
        $ssc->organizations()->syncWithoutDetaching([$orgs['SSC']->id]);
        $byte->organizations()->syncWithoutDetaching([$orgs['BYTE']->id]);
        $officer->organizations()->syncWithoutDetaching([$orgs['BYTE']->id]);
        foreach ($students as $i => $s) {
            $s->organizations()->syncWithoutDetaching([$orgs['BYTE']->id, $orgs->values()[($i % 4) + 1]->id]);
        }

        // --- Committees + tasks --------------------------------------------
        $comm = [
            'Events Committee' => Committee::firstOrCreate(['organization_id' => $orgs['BYTE']->id, 'name' => 'Events Committee']),
            'Tech Team' => Committee::firstOrCreate(['organization_id' => $orgs['BYTE']->id, 'name' => 'Tech Team']),
            'Senate' => Committee::firstOrCreate(['organization_id' => $orgs['SSC']->id, 'name' => 'Student Senate']),
        ];
        $rows = [
            ['Events Committee', 'Procure sound setup for assembly hall', 'backlog', 'medium', 10],
            ['Events Committee', 'Finalize caterer menu for autumn gala', 'todo', 'high', 4],
            ['Tech Team', 'HackTheCampus: prepare registration portal', 'in_progress', 'high', 9],
            ['Tech Team', 'Design flyers for wellness clinic', 'in_progress', 'medium', 12],
            ['Events Committee', 'Publish campus safety audit findings', 'review', 'low', 6],
            ['Tech Team', 'Setup online election voting portals', 'done', 'high', -2],
            ['Senate', 'Approve student senate budget allocation', 'review', 'high', 5],
            ['Senate', 'Draft resolution on campus plastic ban', 'todo', 'medium', 14],
        ];
        foreach ($rows as $i => [$c, $title, $status, $prio, $days]) {
            $creator = $c === 'Senate' ? $sscOfficer : $committeeOfficer;
            Task::firstOrCreate(['title' => $title], [
                'committee_id' => $comm[$c]->id, 'status' => $status, 'priority' => $prio,
                'assigned_to' => $students[$i % 4]->id, 'due_date' => now()->addDays($days), 'created_by' => $creator->id,
            ]);
        }

        // --- Events with budget + checklist ---------------------------------
        $events = [
            ['Autumn Gala Executive Briefing', 'BYTE', 'Main Assembly Hall', 1, [['Venue', 3000, 2800], ['Catering', 2500, 1400]], [true, true, false, false]],
            ['HackTheCampus: Autumn', 'BYTE', 'Tech Wing Labs', 12, [['Prizes', 2000, 800], ['Swag', 1000, 0]], [true, false, false]],
            ['Senate Bi-Weekly Session', 'SSC', 'Council Chambers', 6, [['Refreshments', 200, 120]], [true, true]],
        ];
        foreach ($events as [$title, $org, $loc, $inDays, $budget, $checks]) {
            $e = Event::firstOrCreate(['title' => $title], [
                'organization_id' => $orgs[$org]->id, 'location' => $loc, 'status' => 'planned',
                'starts_at' => now()->addDays($inDays)->setTime(14, 0), 'ends_at' => now()->addDays($inDays)->setTime(17, 0),
                'created_by' => ($org === 'SSC' ? $sscOfficer : $committeeOfficer)->id,
            ]);
            if ($e->wasRecentlyCreated) {
                foreach ($budget as [$l, $est, $act]) {
                    $e->budgetItems()->create(['label' => $l, 'estimated_cost' => $est, 'actual_cost' => $act]);
                }
                foreach ($checks as $n => $done) {
                    $e->checklistItems()->create(['label' => 'Prep item '.($n + 1), 'is_done' => $done]);
                }
            }
        }

        // --- Concerns (one anonymous, to demo redaction) --------------------
        $cs = [
            ['Inadequate lighting in the South Campus parking lot', 'Facilities', 'high', true, 'submitted'],
            ['Cafeteria vegan options expansion', 'Services', 'low', false, 'forwarded'],
            ['Library silent zone policy enforcement', 'Academics', 'medium', false, 'resolved'],
        ];
        foreach ($cs as $i => [$subject, $cat, $prio, $anon, $status]) {
            Concern::firstOrCreate(['subject' => $subject], [
                'student_id' => $students[$i]->id, 'organization_id' => $orgs['BYTE']->id, 'category' => $cat,
                'priority' => $prio, 'is_anonymous' => $anon, 'status' => $status,
                'body' => 'Demo concern body text describing the issue in a few sentences.',
                'resolved_at' => $status === 'resolved' ? now()->subDays(2) : null,
            ]);
        }

        FeedItem::record($students[0], $orgs['BYTE']->id, 'uploaded "Autumn Gala Budget.xlsx"');
        FeedItem::record($students[1], $orgs['BYTE']->id, 'closed concern #108 (Campus Lighting)');
        FeedItem::record($students[2], $orgs['BYTE']->id, 'created a new task in Kanban Board');
    }
}
