<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    protected $fillable = ['folder_id', 'name', 'file_type', 'access_level', 'current_version', 'uploaded_by'];

    public const ACCESS_LEVELS = ['public', 'org_only'];

    public function folder(): BelongsTo { return $this->belongsTo(DocumentFolder::class, 'folder_id'); }
    public function uploader(): BelongsTo { return $this->belongsTo(User::class, 'uploaded_by'); }
    public function versions(): HasMany { return $this->hasMany(DocumentVersion::class)->orderByDesc('version'); }
}
