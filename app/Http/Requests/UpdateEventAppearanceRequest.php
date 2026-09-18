<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventAppearanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $event = $this->route('event');

        return $event && ($this->user()?->can('update', $event) ?? false);
    }

    protected function prepareForValidation(): void
    {
        // If 'image' is present but not an uploaded file (e.g. a string path from the client),
        // remove it from the input so validation won't include it and it won't overwrite the DB.
        if ($this->has('image') && ! $this->file('image')) {
            $this->replace($this->except('image'));
        }
    }

    public function rules(): array
    {
        $statuses = ['draft', 'active', 'inactive'];

        if ($this->user()?->hasRole('superadmin')) {
            $statuses[] = 'finished';
        }

        return [
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:3000'],
            'status' => ['sometimes', Rule::in($statuses)],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'title' => ['nullable', 'string', 'max:160'],
            'text' => ['nullable', 'string', 'max:1000'],
            'welcome_title' => ['nullable', 'string', 'max:160'],
            'welcome_text' => ['nullable', 'string', 'max:1000'],
            'primary_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'secondary_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'text_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'background_color_primary' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'background_color_secondary' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            // allow replacing image when updating appearance
            'image' => ['nullable', 'image', 'max:5120'],
        ];
    }
}
