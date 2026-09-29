<?php

namespace App\Policies;

use App\Models\DocumentFolder;
use App\Models\User;

class DocumentFolderPolicy
{
    /** Only officers upload, and only into folders of organizations they can manage. */
    public function upload(User $user, DocumentFolder $folder): bool
    {
        $officer = $user->officerProfile;

        return $officer !== null && $officer->visibleOrganizationIds()->contains($folder->organization_id);
    }
}
