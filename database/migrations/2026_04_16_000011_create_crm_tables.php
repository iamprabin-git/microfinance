<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_boards', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('crm_groups', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('board_id')->constrained('crm_boards')->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_collapsed')->default(false);
            $table->timestamps();
        });

        Schema::create('crm_columns', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('board_id')->constrained('crm_boards')->cascadeOnDelete();
            $table->string('name');
            $table->string('key'); // stable identifier used in item.values JSON
            $table->string('type')->default('text');
            $table->json('options')->nullable(); // e.g. status labels
            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_required')->default(false);
            $table->timestamps();

            $table->unique(['board_id', 'key']);
        });

        Schema::create('crm_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('board_id')->constrained('crm_boards')->cascadeOnDelete();
            $table->foreignId('group_id')->nullable()->constrained('crm_groups')->nullOnDelete();
            $table->foreignId('assignee_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('status')->nullable(); // quick filter (optional)
            $table->json('values')->nullable(); // { columnKey: value }
            $table->timestamps();
        });

        Schema::create('crm_item_activities', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('board_id')->constrained('crm_boards')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('crm_items')->cascadeOnDelete();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event'); // created, updated, status_changed, assigned, moved_group, etc.
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['board_id', 'item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_item_activities');
        Schema::dropIfExists('crm_items');
        Schema::dropIfExists('crm_columns');
        Schema::dropIfExists('crm_groups');
        Schema::dropIfExists('crm_boards');
    }
};

