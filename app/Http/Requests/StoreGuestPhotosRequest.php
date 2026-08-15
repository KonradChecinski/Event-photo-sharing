<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGuestPhotosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->route('event')?->acceptsGuestUploads() ?? false;
    }

    public function rules(): array
    {
        return [
            'photos' => ['required', 'array', 'max:50'],
            'photos.*' => [
                'required',
                'file',
                'max:20480',
                'mimes:jpg,jpeg,png,webp,heic,heif',
                'mimetypes:image/jpeg,image/png,image/webp,image/heic,image/heif',
            ],
        ];
    }
}
