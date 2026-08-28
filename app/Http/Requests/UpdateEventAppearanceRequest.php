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

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'welcome_title' => ['nullable', 'string', 'max:160'],
            'welcome_text' => ['nullable', 'string', 'max:1000'],
            'primary_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'secondary_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'text_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'background_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'status' => ['sometimes', Rule::in(['draft', 'active', 'inactive', 'finished'])],
            // allow replacing welcome image when updating appearance
            'welcome_image' => ['nullable', 'image', 'max:5120'],
        ];
    }
}
