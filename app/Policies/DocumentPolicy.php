<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;
use App\Support\OrgScope;

class DocumentPolicy
{
    /** public = any signed-in user; org_only = member/officer of the folder's organization. */
    public function view(User $user, Document $document): bool
    {
        return $document->access_level === 'public'
            || OrgScope::idsFor($user)->contains($document->folder->organization_id);
    }
}
